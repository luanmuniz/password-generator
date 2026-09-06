const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { it } = require('node:test');

const root = path.resolve(__dirname, '..');
const environment = { ...process.env };
delete environment.NODE_V8_COVERAGE;

it.skip('benchmark compares master with working files and cleans up its worktree', () => {
	const worktreesBefore = spawnSync('git', ['worktree', 'list', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout;
	const result = spawnSync(process.execPath, ['bench/compare.cjs', '--rounds', '1', '--warmup', '1', '--duration', '1'], {
		cwd: root, env: environment, encoding: 'utf8', timeout: 30000
	});

	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /Baseline: master \([a-f0-9]{40}\)/);
	assert.match(result.stdout, /Current: .*working files/);
	assert.match(result.stdout, /52 unique letters/);
	assert.match(result.stdout, /Speedup/);
	assert.equal(spawnSync('git', ['worktree', 'list', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout, worktreesBefore);
});

it.skip('benchmark rejects invalid refs and invalid measurement settings', () => {
	for(const args of [['--baseline', 'missing-benchmark-ref'], ['--rounds', '0']]) {
		const result = spawnSync(process.execPath, ['bench/compare.cjs', ...args], {
			cwd: root, env: environment, encoding: 'utf8', timeout: 10000
		});

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Benchmark failed:/);
	}
});

it.skip('benchmark worker rejects incorrect password output before measuring', () => {
	const directory = mkdtempSync(path.join(tmpdir(), 'password-benchmark-test-'));
	try {
		writeFileSync(path.join(directory, 'index.js'), "module.exports = { generate: () => 'invalid' };\n");
		const result = spawnSync(process.execPath, ['bench/worker.cjs', directory, '1', '1'], {
			cwd: root, env: environment, encoding: 'utf8', timeout: 10000
		});

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Default password/);
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
