'use strict';

var expect = require('chai').expect,
	passwordGenerator = require('../index'),
	numberRegex = /[0-9]/g,
	symbolsRegex = /[^0-9a-zA-Z]/g,
	UpperCaseRegex = /[A-Z]/g;

describe('generate', function() {
	it('Generate function should exist', () => {
		expect(passwordGenerator).to.have.property('generate').with.is.a('function');
	});

	it('Generate should generate a random string', () => {
		var stringGenerated = passwordGenerator.generate();

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with size equal to 20 as number', () => {
		var stringGenerated = passwordGenerator.generate(20);

		expect(stringGenerated).to.be.a('string').and.to.have.length(20);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with size equal to 20 as param', () => {
		var stringGenerated = passwordGenerator.generate({ size: 20 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(20);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with allowUppercase false', () => {
		var stringGenerated = passwordGenerator.generate({ allowUppercase: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(UpperCaseRegex)).to.be.equal(null);
	});

	it('Generate should generate a random string with numbers as false', () => {
		var stringGenerated = passwordGenerator.generate({ numbers: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.equal(null);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with numbers as 10', () => {
		var stringGenerated = passwordGenerator.generate({ numbers: 10 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(10);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with numbers equal to size', () => {
		var stringGenerated = passwordGenerator.generate({ numbers: 16 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.length(11);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with numbers equal to size and symbol equal to false', () => {
		var stringGenerated = passwordGenerator.generate({ numbers: 16, symbols: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.length(16);
		expect(stringGenerated.match(symbolsRegex)).to.be.equal(null);
	});

	it('Generate should generate a random string with numbers bigger than size', () => {
		var stringGenerated = passwordGenerator.generate({ numbers: 20 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.length(11);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(5);
	});

	it('Generate should generate a random string with symbols as false', () => {
		var stringGenerated = passwordGenerator.generate({ symbols: false });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.equal(null);
	});

	it('Generate should generate a random string with symbols as 10', () => {
		var stringGenerated = passwordGenerator.generate({ symbols: 10 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.have.length(5);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(10);
	});

	it('Generate should generate a random string with symbols equal to size', () => {
		var stringGenerated = passwordGenerator.generate({ symbols: 16 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.equal(null);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(16);
	});

	it('Generate should generate a random string with symbols bigger than size', () => {
		var stringGenerated = passwordGenerator.generate({ symbols: 20 });

		expect(stringGenerated).to.be.a('string').and.to.have.length(16);
		expect(stringGenerated.match(numberRegex)).to.be.equal(null);
		expect(stringGenerated.match(symbolsRegex)).to.have.length(16);
	});
});
