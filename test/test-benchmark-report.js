const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { createReport } = require('../bench/report.cjs');

const samples = [
	{ name: 'Improved', baselineMicroseconds: 10, currentMicroseconds: 9 },
	{ name: 'Unchanged', baselineMicroseconds: 10, currentMicroseconds: 10.4 },
	{ name: 'Degraded', baselineMicroseconds: 10, currentMicroseconds: 11 }
];

describe('benchmark report', () => {
	it('classifies changes outside the five percent threshold', () => {
		const report = createReport(samples);

		assert.deepEqual(report.scenarios.map(scenario => scenario.evaluation), [ 'Improved', 'Unchanged', 'Degraded' ]);
		assert.deepEqual(report.summary, {
			improved: 1,
			unchanged: 1,
			degraded: 1,
			evaluation: 'Performance improved in 1 scenario, kept the same in 1 scenario, and degraded in 1 scenario.'
		});
	});

	it('reports when every scenario keeps the same performance', () => {
		const report = createReport([
			{ name: 'First', baselineMicroseconds: 10, currentMicroseconds: 9.6 },
			{ name: 'Second', baselineMicroseconds: 10, currentMicroseconds: 10.4 }
		]);

		assert.equal(report.summary.evaluation, 'Performance kept the same in all 2 scenarios.');
	});
});
