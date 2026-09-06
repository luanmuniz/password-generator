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

	it('shuffleString preserves every character, including repetitions', () => {
		for(const originalString of ['aB3!', 'aaBB33!!', 'aB3!'.repeat(256)]) {
			const shuffledString = passwordGenerator.shuffleString(originalString);

			assert.strictEqual(shuffledString.length, originalString.length);
			assert.deepStrictEqual(shuffledString.split('').sort(), originalString.split('').sort());
			assert.notStrictEqual(shuffledString, originalString);
		}
	});

	it('shuffleString retries when the shuffle leaves the string unchanged', (context) => {
		let calls = 0;
		context.mock.method(Math, 'random', () => {
			calls += 1;
			assert.ok(calls <= 6, 'The second shuffle should change the string');
			return calls <= 3 ? 0.99 : 0;
		});

		assert.strictEqual(passwordGenerator.shuffleString('abc'), 'bca');
		assert.ok(calls > 3, 'An unchanged shuffle should be retried');
	});
});
