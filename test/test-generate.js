const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const passwordGenerator = require('../index');

const numberRegex = /[0-9]/g;
const symbolsRegex = /[^0-9a-zA-Z]/g;
const UpperCaseRegex = /[A-Z]/g;

describe('generate', function() {
	it('Generate function should exist', () => {
		assert.strictEqual(typeof passwordGenerator.generate, 'function');
	});

	it('Generate should generate a random string', () => {
		const stringGenerated = passwordGenerator.generate();

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 5);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 5);
	});

	it('Generate should generate a random string with size equal to 20 as number', () => {
		const stringGenerated = passwordGenerator.generate(20);

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 20);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 5);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 5);
	});

	it('Generate should generate a random string with size equal to 20 as param', () => {
		const stringGenerated = passwordGenerator.generate({ size: 20 });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 20);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 5);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 5);
	});

	it('Generate should generate a random string with allowUppercase false', () => {
		const stringGenerated = passwordGenerator.generate({ allowUppercase: false });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(UpperCaseRegex) || []).length, 0);
	});

	it('Generate should generate a random string with numbers as false', () => {
		const stringGenerated = passwordGenerator.generate({ numbers: false });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 0);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 5);
	});

	it('Generate should generate a random string with numbers as 10', () => {
		const stringGenerated = passwordGenerator.generate({ numbers: 10 });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 10);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 5);
	});

	it('Generate should generate a random string with numbers equal to size', () => {
		const stringGenerated = passwordGenerator.generate({ numbers: 16 });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 11);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 5);
	});

	it('Generate should generate a random string with numbers equal to size and symbol equal to false', () => {
		const stringGenerated = passwordGenerator.generate({ numbers: 16, symbols: false });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 16);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 0);
	});

	it('Generate should generate a random string with numbers bigger than size', () => {
		const stringGenerated = passwordGenerator.generate({ numbers: 20 });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 11);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 5);
	});

	it('Generate should generate a random string with symbols as false', () => {
		const stringGenerated = passwordGenerator.generate({ symbols: false });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 5);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 0);
	});

	it('Generate should generate a random string with symbols as 10', () => {
		const stringGenerated = passwordGenerator.generate({ symbols: 10 });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 5);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 10);
	});

	it('Generate should generate a random string with symbols equal to size', () => {
		const stringGenerated = passwordGenerator.generate({ symbols: 16 });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 0);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 16);
	});

	it('Generate should generate a random string with symbols bigger than size', () => {
		const stringGenerated = passwordGenerator.generate({ symbols: 20 });

		assert.strictEqual(typeof stringGenerated, 'string');
		assert.strictEqual(stringGenerated.length, 16);
		assert.strictEqual((stringGenerated.match(numberRegex) || []).length, 0);
		assert.strictEqual((stringGenerated.match(symbolsRegex) || []).length, 16);
	});
});
