'use strict';

const THRESHOLD_PERCENT = 5;

function scenarioLabel(count) {
	return `${count} ${count === 1 ? 'scenario' : 'scenarios'}`;
}

function createEvaluation(summary, total) {
	if(summary.unchanged === total) {
		return `Performance kept the same in all ${scenarioLabel(total)}.`;
	}

	const results = [];
	if(summary.improved > 0) {
		results.push(`improved in ${scenarioLabel(summary.improved)}`);
	}
	if(summary.unchanged > 0) {
		results.push(`kept the same in ${scenarioLabel(summary.unchanged)}`);
	}
	if(summary.degraded > 0) {
		results.push(`degraded in ${scenarioLabel(summary.degraded)}`);
	}

	return `Performance ${results.join(', ').replace(/, ([^,]+)$/, ', and $1')}.`;
}

function createReport(samples) {
	const summary = { improved: 0, unchanged: 0, degraded: 0 };
	const scenarios = samples.map(sample => {
		const changePercent = (sample.currentMicroseconds / sample.baselineMicroseconds - 1) * 100;
		let evaluation = 'Unchanged';

		if(changePercent <= -THRESHOLD_PERCENT) {
			evaluation = 'Improved';
			summary.improved += 1;
		} else if(changePercent >= THRESHOLD_PERCENT) {
			evaluation = 'Degraded';
			summary.degraded += 1;
		} else {
			summary.unchanged += 1;
		}

		return {
			name: sample.name,
			baselineMicroseconds: sample.baselineMicroseconds,
			currentMicroseconds: sample.currentMicroseconds,
			baselineMadPercent: sample.baselineMadPercent,
			currentMadPercent: sample.currentMadPercent,
			changePercent,
			speedup: sample.baselineMicroseconds / sample.currentMicroseconds,
			evaluation
		};
	});

	return {
		thresholdPercent: THRESHOLD_PERCENT,
		scenarios,
		summary: { ...summary, evaluation: createEvaluation(summary, scenarios.length) }
	};
}

module.exports = { createReport };
