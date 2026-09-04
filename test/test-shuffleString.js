const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const passwordGenerator = require('../index');

describe('shuffleString', function() {
	it('shuffleString function should exist', () => {
		assert.strictEqual(typeof passwordGenerator.shuffleString, 'function');
	});

	it('shuffleString return is not equal to inicial string', () => {
		for(let index = 0; index < 24; index++) {
			const shuffledString = passwordGenerator.shuffleString('abc');

			assert.strictEqual(typeof shuffledString, 'string');
			assert.notStrictEqual(shuffledString, 'abc');
		}
	});
});
