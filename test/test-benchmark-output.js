const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { it } = require('node:test');

const root = path.resolve(__dirname, '..');
const environment = { ...process.env };
delete environment.NODE_V8_COVERAGE;

it('benchmark writes a versioned report with an evaluation for every scenario', () => {
	const directory = mkdtempSync(path.join(tmpdir(), 'password-benchmark-output-'));
	const output = path.join(directory, 'report.json');
	try {
		const result = spawnSync(process.execPath, [
			'bench/compare.cjs', '--baseline', 'HEAD', '--rounds', '1', '--warmup', '1', '--duration', '1', '--output', output
		], { cwd: root, env: environment, encoding: 'utf8', timeout: 30000 });

		assert.equal(result.status, 0, result.stderr);
		const report = JSON.parse(readFileSync(output, 'utf8'));
		assert.equal(report.schemaVersion, 1);
		assert.equal(report.thresholdPercent, 5);
		assert.equal(report.scenarios.length, 6);
		assert.match(report.summary.evaluation, /^Performance /);
		for(const scenario of report.scenarios) {
			assert.ok([ 'Improved', 'Unchanged', 'Degraded' ].includes(scenario.evaluation));
		}
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
