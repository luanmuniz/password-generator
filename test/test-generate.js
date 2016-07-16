'use strict';

var expect = require('chai').expect,
	generatePassword = require('../index'),
	numberRegex = /[0-9]/g,
	symbolsRegex = /[^0-9a-zA-Z]/g,
	UpperCaseRegex = /[A-Z]/g;

describe('generate', function() {
	it('Generate function should exist', () => {
		expect(generatePassword).to.be.a('function');
	});

	it('Generate should generate a random string', () => {
		var stringGenerated = generatePassword();

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with size equal to 20 as number', () => {
		var stringGenerated = generatePassword(20);

		expect(stringGenerated).to.be.a('string').and.to.have.length(20);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with size equal to 20 as param', () => {
		var stringGenerated = generatePassword({ size: 20 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(20);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with allowUppercase false', () => {
		var stringGenerated = generatePassword({ allowUppercase: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(UpperCaseRegex)).to.be.equal(null);
	});

	it('Generate should generate a random string with numbers as false', () => {
		var stringGenerated = generatePassword({ numbers: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.equal(null);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with numbers as 10', () => {
		var stringGenerated = generatePassword({ numbers: 10 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(10);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with numbers equal to size', () => {
		var stringGenerated = generatePassword({ numbers: 16 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.length(11);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with numbers equal to size and symbol equal to false', () => {
		var stringGenerated = generatePassword({ numbers: 16, symbols: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.length(16);
		expect(stringGenerated.match(symbolsRegex)).to.be.equal(null);
	});

	it('Generate should generate a random string with numbers bigger than size', () => {
		var stringGenerated = generatePassword({ numbers: 20 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.length(11);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with symbols as false', () => {
		var stringGenerated = generatePassword({ symbols: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.equal(null);
	});

	it('Generate should generate a random string with symbols as 10', () => {
		var stringGenerated = generatePassword({ symbols: 10 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(10);
	});

	it('Generate should generate a random string with symbols equal to size', () => {
		var stringGenerated = generatePassword({ symbols: 16 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.equal(null);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(16);
	});

	it('Generate should generate a random string with symbols bigger than size', () => {
		var stringGenerated = generatePassword({ symbols: 20 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.equal(null);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(16);
	});
});
