const assert = require('node:assert/strict');
const { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { it } = require('node:test');

const root = path.resolve(__dirname, '..');
const commit = 'a'.repeat(40);
const baselineCommit = 'b'.repeat(40);
const mergeCommit = 'c'.repeat(40);
const scenarios = [
	'Default password',
	'52 unique letters',
	'1024 characters, repetitions',
	'Shuffle 16 characters',
	'Shuffle 52 characters',
	'Shuffle 1024 characters'
].map(name => ({ name, baselineMicroseconds: 10, currentMicroseconds: 8 }));

function runCommentScript(comments, { parents = [baselineCommit, commit], pullHead = commit } = {}) {
	const directory = mkdtempSync(path.join(tmpdir(), 'password-comment-test-'));
	const artifact = path.join(directory, 'artifact');
	const executableDirectory = path.join(directory, 'bin');
	const log = path.join(directory, 'request.json');
	try {
		mkdirSync(artifact);
		mkdirSync(executableDirectory);
		writeFileSync(path.join(directory, 'command.txt'), '');
		writeFileSync(path.join(artifact, 'benchmark-pr-number.txt'), '42\n');
		writeFileSync(path.join(artifact, 'benchmark-result.json'), JSON.stringify({
			schemaVersion: 1,
			thresholdPercent: 5,
			baseline: { commit: baselineCommit },
			current: { commit: mergeCommit },
			scenarios
		}));
		writeFileSync(path.join(executableDirectory, 'gh'), `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "$GH_COMMAND_LOG"
if [[ " $* " == *" --method GET "* ]]; then
	if [[ " $* " == *" --silent "* ]]; then
		exit 0
	fi
	case "$*" in
		*repos/owner/repository/pulls/42*) printf '%s' "$GH_PULL" ;;
		*repos/owner/repository/commits/${mergeCommit}*) printf '%s' "$GH_COMMIT" ;;
		*repos/owner/repository/issues/42/comments*) printf '%s' "$GH_COMMENTS" ;;
		*) exit 1 ;;
	esac
	else
	input=''
	previous=''
	for argument in "$@"; do
		if [[ "$previous" == '--input' ]]; then
			input="$argument"
			break
		fi
		previous="$argument"
	done
	cat "$input" > "$GH_REQUEST_LOG"
	fi
`);
		chmodSync(path.join(executableDirectory, 'gh'), 0o755);

		const result = spawnSync('bash', ['.github/scripts/comment-performance.sh'], {
			cwd: root,
			encoding: 'utf8',
			env: {
				...process.env,
				BENCHMARK_ARTIFACT_PATH: artifact,
				BENCHMARK_WORKFLOW_SHA: commit,
				GH_REPO: 'owner/repository',
				GH_PULL: JSON.stringify({ head: { sha: pullHead }, base: { repo: { full_name: 'owner/repository' } } }),
				GH_COMMIT: JSON.stringify({ sha: mergeCommit, parents: parents.map(sha => ({ sha })) }),
				GH_COMMENTS: JSON.stringify([Array.isArray(comments) ? comments : [comments]]),
				GH_REQUEST_LOG: log,
				GH_COMMAND_LOG: path.join(directory, 'command.txt'),
				PATH: `${executableDirectory}:${process.env.PATH}`
			}
		});

		return {
			status: result.status,
			stderr: result.stderr,
			body: existsSync(log) ? JSON.parse(readFileSync(log, 'utf8')).body : undefined,
			command: readFileSync(path.join(directory, 'command.txt'), 'utf8')
		};
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
}

it('creates a validated performance comment for a PR merge commit', () => {
	const result = runCommentScript([]);

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.command, /--method POST repos\/owner\/repository\/issues\/42\/comments/);
	assert.match(result.body, /Performance improved in 6 scenarios/);
	assert.match(result.body, /\| Default password \| 10\.000 \| 8\.000 \| -20\.0% \| Improved \|/);
});

it('updates the previous performance comment', () => {
	const result = runCommentScript({
		id: 99,
		user: { type: 'Bot' },
		body: '<!-- password-generator-performance -->'
	});

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.command, /--method PATCH repos\/owner\/repository\/issues\/comments\/99/);
	assert.doesNotMatch(result.command, /--method POST/);
});

it('rejects a benchmark from a different PR head before posting', () => {
	const result = runCommentScript([], { pullHead: 'd'.repeat(40) });

	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /Benchmark does not match the pull request/);
	assert.doesNotMatch(result.command, /--method (POST|PATCH)/);
});

it('rejects a merge commit with an unrelated base or PR head before posting', () => {
	for(const parents of [[baselineCommit, 'd'.repeat(40)], ['d'.repeat(40), commit]]) {
		const result = runCommentScript([], { parents });

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Benchmark merge commit does not match the base and PR head/);
		assert.doesNotMatch(result.command, /--method (POST|PATCH)/);
	}
});
