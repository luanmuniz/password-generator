const assert = require('node:assert/strict');
const { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { it } = require('node:test');

const root = path.resolve(__dirname, '..');
const commit = 'a'.repeat(40);
const scenarios = [
	'Default password',
	'52 unique letters',
	'1024 characters, repetitions',
	'Shuffle 16 characters',
	'Shuffle 52 characters',
	'Shuffle 1024 characters'
].map(name => ({ name, baselineMicroseconds: 10, currentMicroseconds: 8 }));

function runCommentScript(comments) {
	const directory = mkdtempSync(path.join(tmpdir(), 'password-comment-test-'));
	const artifact = path.join(directory, 'artifact');
	const executableDirectory = path.join(directory, 'bin');
	const log = path.join(directory, 'request.json');
	try {
		mkdirSync(artifact);
		mkdirSync(executableDirectory);
		writeFileSync(path.join(artifact, 'benchmark-pr-number.txt'), '42\n');
		writeFileSync(path.join(artifact, 'benchmark-result.json'), JSON.stringify({
			schemaVersion: 1,
			thresholdPercent: 5,
			baseline: { commit },
			current: { commit },
			scenarios
		}));
		writeFileSync(path.join(executableDirectory, 'gh'), `#!/usr/bin/env bash
set -euo pipefail
if [[ " $* " == *" --method GET "* ]]; then
	printf '%s' "$GH_COMMENTS"
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
	printf '%s\\n' "$*" >> "$GH_COMMAND_LOG"
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
				GH_COMMENTS: JSON.stringify([Array.isArray(comments) ? comments : [comments]]),
				GH_REQUEST_LOG: log,
				GH_COMMAND_LOG: path.join(directory, 'command.txt'),
				PATH: `${executableDirectory}:${process.env.PATH}`
			}
		});

		assert.equal(result.status, 0, result.stderr);
		return {
			body: JSON.parse(readFileSync(log, 'utf8')).body,
			command: readFileSync(path.join(directory, 'command.txt'), 'utf8')
		};
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
}

it.skip('creates a validated performance comment', () => {
	const result = runCommentScript([]);

	assert.match(result.command, /--method POST repos\/owner\/repository\/issues\/42\/comments/);
	assert.match(result.body, /Performance improved in 6 scenarios/);
	assert.match(result.body, /\| Default password \| 10\.000 \| 8\.000 \| -20\.0% \| Improved \|/);
});

it.skip('updates the previous performance comment', () => {
	const result = runCommentScript({
		id: 99,
		user: { type: 'Bot' },
		body: '<!-- password-generator-performance -->'
	});

	assert.match(result.command, /--method PATCH repos\/owner\/repository\/issues\/comments\/99/);
});
