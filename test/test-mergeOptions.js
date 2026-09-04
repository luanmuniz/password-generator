const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const passwordGenerator = require('../index');

describe('mergeOptions', function() {
	const defaultValues = {
		size: 16,
		numbers: 5,
		symbols: 5,
		allowUppercase: true,
		allowRepetintion: false
	};

	it('mergeOptions function should exist', () => {
		assert.strictEqual(typeof passwordGenerator.mergeOptions, 'function');
	});

	it('mergeOptions with default options', () => {
		assert.deepStrictEqual(passwordGenerator.mergeOptions([]), defaultValues);
	});

	it('mergeOptions with default options but size number as an argument', () => {
		const thisValues = { ...defaultValues, size: 50 };

		assert.deepStrictEqual(passwordGenerator.mergeOptions([50]), thisValues);
	});

	it('mergeOptions with default options but size in and object', () => {
		const thisValues = { ...defaultValues, size: 50 };

		assert.deepStrictEqual(passwordGenerator.mergeOptions([{ size: 50 }]), thisValues);
	});

	it('mergeOptions with default options but numbers in and object', () => {
		const thisValues = { ...defaultValues, numbers: 10 };

		assert.deepStrictEqual(passwordGenerator.mergeOptions([{ numbers: 10 }]), thisValues);
	});

	it('mergeOptions with default options but symbols in and object', () => {
		const thisValues = { ...defaultValues, symbols: 10 };

		assert.deepStrictEqual(passwordGenerator.mergeOptions([{ symbols: 10 }]), thisValues);
	});

	it('mergeOptions with default options but allowUppercase in and object', () => {
		const thisValues = { ...defaultValues, allowUppercase: false };

		assert.deepStrictEqual(passwordGenerator.mergeOptions([{ allowUppercase: false }]), thisValues);
	});

	it('mergeOptions with default options but allowRepetintion in and object', () => {
		const thisValues = { ...defaultValues, allowRepetintion: true };

		assert.deepStrictEqual(passwordGenerator.mergeOptions([{ allowRepetintion: true }]), thisValues);
	});

	it('mergeOptions with options in and object', () => {
		const thisValues = {
			size: 20,
			numbers: 13,
			symbols: 13,
			allowUppercase: false,
			allowRepetintion: true
		};

		assert.deepStrictEqual(passwordGenerator.mergeOptions([thisValues]), thisValues);
	});

	it('mergeOptions with default options but size in and object', () => {
		const thisValues = {
			size: 20,
			numbers: 12,
			symbols: 12,
			allowUppercase: false,
			allowRepetintion: true
		};

		assert.deepStrictEqual(passwordGenerator.mergeOptions([50, thisValues]), thisValues);
	});

	it('mergeOptions with default options but size in and object', () => {
		const thisValues = {
			numbers: 15,
			symbols: 15,
			allowUppercase: false,
			allowRepetintion: true
		};

		assert.deepStrictEqual(passwordGenerator.mergeOptions([50, thisValues]), {
			size: 50,
			numbers: 15,
			symbols: 15,
			allowUppercase: false,
			allowRepetintion: true
		});
	});
});
