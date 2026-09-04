const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { chmodSync, cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { describe, it } = require('node:test');

const versionScript = resolve(__dirname, '..', 'version.sh');
const releasePullRequestTemplate = resolve(__dirname, '..', '.github', 'PULL_REQUEST_TEMPLATE', 'release.md');

function run(command, args, cwd, environment = {}) {
	return execFileSync(command, args, {
		cwd,
		encoding: 'utf8',
		env: { ...process.env, ...environment }
	}).trim();
}

function createRepository() {
	const temporaryDirectory = mkdtempSync(join(tmpdir(), 'password-generator-version-'));
	const remoteDirectory = join(temporaryDirectory, 'remote.git');
	const repositoryDirectory = join(temporaryDirectory, 'repository');

	run('git', ['init', '--bare', '--initial-branch=master', remoteDirectory], temporaryDirectory);
	mkdirSync(repositoryDirectory);
	run('git', ['init', '--initial-branch=master'], repositoryDirectory);
	run('git', ['config', 'user.name', 'Version Script Test'], repositoryDirectory);
	run('git', ['config', 'user.email', 'version-script@example.com'], repositoryDirectory);
	writeFileSync(join(repositoryDirectory, 'package.json'), `${JSON.stringify({
		name: 'version-script-test',
		version: '1.2.3',
		scripts: { test: 'node -e ""' }
	}, null, 2)}\n`);
	writeFileSync(join(repositoryDirectory, 'CHANGELOG.md'), '# Changelog\n\n### Unreleased\n\nTest change\n\nFuture Features\n===============\n');
	cpSync(versionScript, join(repositoryDirectory, 'version.sh'));
	mkdirSync(join(repositoryDirectory, '.github', 'PULL_REQUEST_TEMPLATE'), { recursive: true });
	cpSync(releasePullRequestTemplate, join(repositoryDirectory, '.github', 'PULL_REQUEST_TEMPLATE', 'release.md'));
	run('npm', ['install', '--package-lock-only', '--ignore-scripts'], repositoryDirectory);
	run('git', ['add', '.'], repositoryDirectory);
	run('git', ['commit', '-m', 'Initial commit'], repositoryDirectory);
	run('git', ['remote', 'add', 'origin', remoteDirectory], repositoryDirectory);
	run('git', ['push', '--set-upstream', 'origin', 'master'], repositoryDirectory);

	return { temporaryDirectory, repositoryDirectory };
}

function createGithubCli(temporaryDirectory) {
	const binaryDirectory = join(temporaryDirectory, 'bin');
	const argumentsPath = join(temporaryDirectory, 'gh-arguments.txt');
	const templatePath = join(temporaryDirectory, 'gh-template.md');
	const npmCachePath = join(temporaryDirectory, 'npm-cache');
	const binaryPath = join(binaryDirectory, 'gh');

	mkdirSync(binaryDirectory);
	writeFileSync(binaryPath, `#!/usr/bin/env bash
set -euo pipefail

if [[ "$1" == 'auth' && "$2" == 'status' ]]; then
	exit 0
fi

if [[ "$1" == 'pr' && "$2" == 'create' ]]; then
	printf '%s\\n' "$@" > "$GH_ARGUMENTS_PATH"

	while [[ $# -gt 0 ]]; do
		if [[ "$1" == '--template' ]]; then
			cp "$2" "$GH_TEMPLATE_PATH"
			break
		fi
		shift
	done

	echo 'https://github.com/example/version-script-test/pull/1'
	exit 0
fi

exit 1
`);
	chmodSync(binaryPath, 0o755);

	return {
		argumentsPath,
		templatePath,
		environment: {
			GH_ARGUMENTS_PATH: argumentsPath,
			GH_TEMPLATE_PATH: templatePath,
			npm_config_cache: npmCachePath,
			PATH: `${binaryDirectory}:${process.env.PATH}`
		}
	};
}

describe('version.sh', () => {
	it('rejects unsupported release types', () => {
		const result = spawnSync('bash', [versionScript, 'breaking'], { encoding: 'utf8' });

		assert.equal(result.status, 1);
		assert.match(result.stderr, /Usage: bash version\.sh \{patch\|minor\|major\}/);
	});

	it('uses npm to bump versions and Bash to update the changelog', () => {
		const script = readFileSync(versionScript, 'utf8');

		assert.match(script, /npm version "\$release_type" --no-git-tag-version --ignore-scripts/);
		assert.match(script, /while IFS= read -r changelog_line/);
		assert.doesNotMatch(script, /node -/);
	});

	for (const [releaseType, expectedVersion] of [['patch', '1.2.4'], ['minor', '1.3.0'], ['major', '2.0.0']]) {
		it(`prepares and pushes a ${releaseType} release branch`, () => {
			const { temporaryDirectory, repositoryDirectory } = createRepository();
			const githubCli = createGithubCli(temporaryDirectory);

			try {
				const output = run('bash', ['version.sh', releaseType], repositoryDirectory, githubCli.environment);
				const packageJson = JSON.parse(readFileSync(join(repositoryDirectory, 'package.json')));
				const packageLock = JSON.parse(readFileSync(join(repositoryDirectory, 'package-lock.json')));
				const changelog = readFileSync(join(repositoryDirectory, 'CHANGELOG.md'), 'utf8');
				const pullRequestArguments = readFileSync(githubCli.argumentsPath, 'utf8');
				const pullRequestTemplate = readFileSync(githubCli.templatePath, 'utf8');
				const releaseBranch = `release/v${expectedVersion}`;

				assert.equal(run('git', ['branch', '--show-current'], repositoryDirectory), releaseBranch);
				assert.equal(packageJson.version, expectedVersion);
				assert.equal(packageLock.version, expectedVersion);
				assert.equal(packageLock.packages[''].version, expectedVersion);
				assert.match(changelog, new RegExp(`### Version ${expectedVersion.replaceAll('.', '\\.')}\\n`));
				assert.match(changelog, /Test change\n\n### Unreleased\n\nFuture Features/);
				assert.equal(run('git', ['log', '-1', '--pretty=%s'], repositoryDirectory), `chore: prepare release ${expectedVersion}`);
				assert.equal(run('git', ['rev-parse', releaseBranch], repositoryDirectory), run('git', ['rev-parse', `origin/${releaseBranch}`], repositoryDirectory));
				assert.equal(run('git', ['tag', '--list', `v${expectedVersion}`], repositoryDirectory), '');
				assert.match(output, /After merging, publish GitHub Release/);
				assert.match(output, new RegExp(`publish GitHub Release v${expectedVersion.replaceAll('.', '\\.')}`));
				assert.match(output, /https:\/\/github\.com\/example\/version-script-test\/pull\/1/);
				assert.match(pullRequestArguments, new RegExp(`--title\\nRelease v${expectedVersion.replaceAll('.', '\\.')}`));
				assert.match(pullRequestArguments, new RegExp(`--base\\nmaster\\n--head\\n${releaseBranch}`));
				assert.match(pullRequestTemplate, new RegExp(`Release v${expectedVersion.replaceAll('.', '\\.')}`));
				assert.match(pullRequestTemplate, /## Suggested GitHub Release/);
				assert.match(pullRequestTemplate, /# Release v/);
			} finally {
				rmSync(temporaryDirectory, { recursive: true, force: true });
			}
		});
	}
});
