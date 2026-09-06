'use strict';

const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { parseArgs } = require('node:util');

const root = path.resolve(__dirname, '..');

function git(...args) {
	return execFileSync('git', ['-c', 'core.fsmonitor=false', ...args], {
		cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 10000
	}).trim();
}

function median(values) {
	const sorted = [...values].sort((first, second) => first - second);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

try {
	const { values } = parseArgs({ options: {
		baseline: { type: 'string', default: 'master' },
		rounds: { type: 'string', default: '10' },
		warmup: { type: 'string', default: '100' },
		duration: { type: 'string', default: '200' }
	} });
	for(const name of ['rounds', 'warmup', 'duration']) {
		if(!Number.isSafeInteger(Number(values[name])) || Number(values[name]) <= 0) {
			throw new Error(`--${name} must be a positive integer`);
		}
	}
	const baseline = git('rev-parse', '--verify', '--end-of-options', `${values.baseline}^{commit}`);
	const current = git('rev-parse', 'HEAD');
	const branch = git('branch', '--show-current') || 'detached HEAD';
	const directory = mkdtempSync(path.join(tmpdir(), 'password-benchmark-'));
	const baselinePath = path.join(directory, 'baseline');
	let worktreeCreated = false;
	try {
		git('worktree', 'add', '--detach', baselinePath, baseline);
		worktreeCreated = true;
		console.log(`Baseline: ${values.baseline} (${baseline})`);
		console.log(`Current: ${branch} (${current}), working files including uncommitted changes`);
		console.log(`Node ${process.version}, ${process.platform}/${process.arch}`);
		console.log(`${values.rounds} rounds; ${values.warmup} ms warm-up and >=${values.duration} ms measurement per scenario per round`);
		const environment = { ...process.env };
		delete environment.NODE_V8_COVERAGE;
		const results = { baseline: [], current: [] };
		for(let round = 0; round < Number(values.rounds); round++) {
			const order = round % 2 ? ['current', 'baseline'] : ['baseline', 'current'];
			for(const version of order) {
				const output = execFileSync(process.execPath, [
					path.join(__dirname, 'worker.cjs'), version === 'baseline' ? baselinePath : root,
					values.warmup, values.duration
				], {
					cwd: root, env: environment, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
					timeout: 10000 + 24 * (Number(values.warmup) + Number(values.duration)), killSignal: 'SIGKILL'
				});
				results[version].push(JSON.parse(output).samples);
			}
			process.stderr.write(`Completed round ${round + 1}/${values.rounds}\n`);
		}
		const rows = results.baseline[0].map((scenario, index) => {
			const baselineSamples = results.baseline.map(round => round[index].microseconds);
			const currentSamples = results.current.map(round => round[index].microseconds);
			const baselineMedian = median(baselineSamples);
			const currentMedian = median(currentSamples);
			return {
				Scenario: scenario.name,
				'Baseline µs/op': baselineMedian.toFixed(3),
				'Current µs/op': currentMedian.toFixed(3),
				'Baseline MAD %': (median(baselineSamples.map(value => Math.abs(value - baselineMedian))) / baselineMedian * 100).toFixed(1),
				'Current MAD %': (median(currentSamples.map(value => Math.abs(value - currentMedian))) / currentMedian * 100).toFixed(1),
				Speedup: `${(baselineMedian / currentMedian).toFixed(2)}x`
			};
		});
		console.table(rows);
		console.log('MAD = median absolute deviation between rounds. Speedup >1 means current is faster.');
	} finally {
		if(worktreeCreated) {
			git('worktree', 'remove', baselinePath);
		}
		rmSync(directory, { recursive: true, force: true });
	}
} catch(error) {
	console.error(`Benchmark failed: ${error.message}`);
	process.exitCode = 1;
}
