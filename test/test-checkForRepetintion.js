const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const passwordGenerator = require('../index');

describe('checkForRepetintion', function() {
	it('checkForRepetintion function should exist', () => {
		assert.strictEqual(typeof passwordGenerator.checkForRepetintion, 'function');
	});

	it('checkForRepetintion function work with alphabet characters', () => {
		assert.strictEqual(passwordGenerator.checkForRepetintion('abc', 'a'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('abc', 'b'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('abc', 'c'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('abc', 'd'), false);
	});

	it('checkForRepetintion function work with numbers characters', () => {
		assert.strictEqual(passwordGenerator.checkForRepetintion('123', '1'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('123', '2'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('123', '3'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('123', '4'), false);
	});

	it('checkForRepetintion function work with symbols characters', () => {
		assert.strictEqual(passwordGenerator.checkForRepetintion('!@#', '!'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('!@#', '@'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('!@#', '#'), true);
		assert.strictEqual(passwordGenerator.checkForRepetintion('!@#', '$'), false);
	});
});
