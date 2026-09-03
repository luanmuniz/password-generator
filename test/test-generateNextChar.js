const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const passwordGenerator = require('../index');

describe('generateNextChar', function() {
	it('generateNextChar function should exist', () => {
		assert.strictEqual(typeof passwordGenerator.generateNextChar, 'function');
	});

	it('generateNextChar without Repetition', () => {
		const options = { allowRepetintion: false, numbers: true, symbols: false };

		assert.strictEqual(passwordGenerator.generateNextChar('1234', '123', options), '4');
		assert.strictEqual(passwordGenerator.generateNextChar('1234', '123', options), '4');
		assert.ok(!['1', '2', '3'].includes(passwordGenerator.generateNextChar('1234', '123', options)));
	});

	it('generateNextChar with Repetition', () => {
		const options = { allowRepetintion: true, numbers: true, symbols: false };

		assert.ok(['a', 'b', 'c', 'd'].includes(passwordGenerator.generateNextChar('abcd', 'abc', options)));
		assert.ok(['a', 'b', 'c'].includes(passwordGenerator.generateNextChar('abc', '123', options)));
		assert.ok(['1', '2', '3', '4'].includes(passwordGenerator.generateNextChar('1234', '123', options)));
	});

	it('generateNextChar with Repetition and numbers and symbols', () => {
		const options = { allowRepetintion: true, numbers: 5, symbols: 5 };

		assert.ok(['a', 'b', 'c', 'd'].includes(passwordGenerator.generateNextChar('abcd', 'abc', options)));
		assert.ok(['a', 'b', 'c'].includes(passwordGenerator.generateNextChar('abc', '123', options)));
		assert.ok(['1', '2', '3', '4'].includes(passwordGenerator.generateNextChar('1234', '123', options)));
	});
});
