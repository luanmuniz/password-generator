'use strict';

var expect = require('chai').expect;
var rewire = require('rewire');
var passwordGenerator = rewire('../index').__get__('PasswordGenerator');

describe('mergeOptions', function() {
	var defaultValues = {
		size: 16,
		numbers: 5,
		symbols: 5,
		allowUppercase: true,
		allowRepetintion: false
	};

	it('mergeOptions function should exist', () => {
		expect(passwordGenerator).to.have.property('mergeOptions').with.is.a('function');
	});

	it('mergeOptions with default options', () => {
		expect(passwordGenerator.mergeOptions([])).to.be.an('object').and.be.deep.equal(defaultValues);
	});

	it('mergeOptions with default options but size number as an argument', () => {
		var thisValues = Object.create(defaultValues);
		thisValues.size = 50;
		expect(passwordGenerator.mergeOptions([50])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with default options but size in and object', () => {
		var thisValues = Object.create(defaultValues);
		thisValues.size = 50;
		expect(passwordGenerator.mergeOptions([{ size: 50 }])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with default options but numbers in and object', () => {
		var thisValues = Object.create(defaultValues);
		thisValues.numbers = 10;
		expect(passwordGenerator.mergeOptions([{ numbers: 10 }])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with default options but symbols in and object', () => {
		var thisValues = Object.create(defaultValues);
		thisValues.symbols = 10;
		expect(passwordGenerator.mergeOptions([{ symbols: 10 }])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with default options but allowUppercase in and object', () => {
		var thisValues = Object.create(defaultValues);
		thisValues.allowUppercase = false;
		expect(passwordGenerator.mergeOptions([{ allowUppercase: false }])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with default options but allowRepetintion in and object', () => {
		var thisValues = Object.create(defaultValues);
		thisValues.allowRepetintion = true;
		expect(passwordGenerator.mergeOptions([{ allowRepetintion: true }])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with options in and object', () => {
		var thisValues = {
			size: 20,
			numbers: 13,
			symbols: 13,
			allowUppercase: false,
			allowRepetintion: true
		};
		expect(passwordGenerator.mergeOptions([thisValues])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with default options but size in and object', () => {
		var thisValues = {
			size: 20,
			numbers: 12,
			symbols: 12,
			allowUppercase: false,
			allowRepetintion: true
		};
		expect(passwordGenerator.mergeOptions([50, thisValues])).to.be.an('object').and.be.deep.equal(thisValues);
	});

	it('mergeOptions with default options but size in and object', () => {
		var thisValues = {
			numbers: 15,
			symbols: 15,
			allowUppercase: false,
			allowRepetintion: true
		};
		expect(passwordGenerator.mergeOptions([50, thisValues])).to.be.an('object').and.be.deep.equal({
			size: 50,
			numbers: 15,
			symbols: 15,
			allowUppercase: false,
			allowRepetintion: true
		});
	});
});
