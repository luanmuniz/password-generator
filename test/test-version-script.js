const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { describe, it } = require('node:test');

const versionScript = resolve(__dirname, '..', 'version.sh');

function run(command, args, cwd) {
	return execFileSync(command, args, { cwd, encoding: 'utf8' }).trim();
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
	run('npm', ['install', '--package-lock-only', '--ignore-scripts'], repositoryDirectory);
	run('git', ['add', '.'], repositoryDirectory);
	run('git', ['commit', '-m', 'Initial commit'], repositoryDirectory);
	run('git', ['remote', 'add', 'origin', remoteDirectory], repositoryDirectory);
	run('git', ['push', '--set-upstream', 'origin', 'master'], repositoryDirectory);

	return { temporaryDirectory, repositoryDirectory };
}

describe('version.sh', () => {
	it('rejects unsupported release types', () => {
		const result = spawnSync('bash', [versionScript, 'breaking'], { encoding: 'utf8' });

		assert.equal(result.status, 1);
		assert.match(result.stderr, /Usage: bash version\.sh \{patch\|minor\|major\}/);
	});

	for (const [releaseType, expectedVersion] of [['patch', '1.2.4'], ['minor', '1.3.0'], ['major', '2.0.0']]) {
		it(`prepares and pushes a ${releaseType} release branch`, () => {
			const { temporaryDirectory, repositoryDirectory } = createRepository();

			try {
				const output = run('bash', ['version.sh', releaseType], repositoryDirectory);
				const packageJson = JSON.parse(readFileSync(join(repositoryDirectory, 'package.json')));
				const packageLock = JSON.parse(readFileSync(join(repositoryDirectory, 'package-lock.json')));
				const changelog = readFileSync(join(repositoryDirectory, 'CHANGELOG.md'), 'utf8');
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
				assert.match(output, /Create and merge a pull request/);
				assert.match(output, new RegExp(`publish GitHub Release v${expectedVersion.replaceAll('.', '\\.')}`));
			} finally {
				rmSync(temporaryDirectory, { recursive: true, force: true });
			}
		});
	}
});
