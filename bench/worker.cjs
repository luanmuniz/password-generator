'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const generator = require(path.join(process.argv[2], 'index.js'));
const warmup = Number(process.argv[3]);
const duration = Number(process.argv[4]);
const scenarios = [
	{ name: 'Default password', options: undefined, size: 16, numbers: 5, symbols: 5 },
	{ name: '52 unique letters', options: { size: 52, numbers: 0, symbols: 0 }, size: 52, numbers: 0, symbols: 0 },
	{ name: '1024 characters, repetitions', options: { size: 1024, allowRepetintion: true }, size: 1024, numbers: 5, symbols: 5 },
	...[16, 52, 1024].map(size => ({
		name: `Shuffle ${size} characters`,
		input: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(Math.ceil(size / 52)).slice(0, size)
	}))
];
let checksum = 0;

function measure(operation, milliseconds) {
	let iterations = 0;
	const start = performance.now();
	let elapsed;
	do {
		for(let index = 0; index < 100; index++) {
			const result = operation();
			checksum = (checksum + result.charCodeAt(0)) >>> 0;
		}
		iterations += 100;
		elapsed = performance.now() - start;
	} while(elapsed < milliseconds);
	return elapsed * 1000 / iterations;
}

const samples = scenarios.map(scenario => {
	const operation = scenario.input
		? () => generator.shuffleString(scenario.input)
		: () => generator.generate(scenario.options);

	try {
		for(let index = 0; index < 50; index++) {
			const result = operation();
			assert.equal(typeof result, 'string');
			if(scenario.input) {
				assert.equal(result.split('').sort().join(''), scenario.input.split('').sort().join(''));
				assert.notEqual(result, scenario.input);
			} else {
				assert.equal(result.length, scenario.size);
				assert.equal((result.match(/[0-9]/g) || []).length, scenario.numbers);
				assert.equal((result.match(/[^a-zA-Z0-9]/g) || []).length, scenario.symbols);
				assert.match(result, /^[a-zA-Z0-9!@#$%&*()_+\-={}\[\]:;<>?,./|]+$/);
				if(!scenario.options?.allowRepetintion) {
					assert.equal(new Set(result).size, result.length);
				}
			}
		}
		measure(operation, warmup);
		return { name: scenario.name, microseconds: measure(operation, duration) };
	} catch(error) {
		throw new Error(`${scenario.name}: ${error.message}`, { cause: error });
	}
});

console.log(JSON.stringify({ samples, checksum }));
