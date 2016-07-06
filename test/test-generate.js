'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('generate', function() {
	it('Generate function should exist', () => {
		expect(passwordGenerator).to.have.property('generate').with.is.a('function');
	});

	it('Generate should generate a random string', () => {
		expect(passwordGenerator.generate())
			.to.be.a('string')
			.and.to.have.length(16);
	});

	it('Generate should generate a random string with allowUppercase false', () => {
		expect(passwordGenerator.generate({ allowUppercase: false }))
			.to.be.a('string')
			.and.to.have.length(16);
	});

	it('Generate should generate a random string with numbers as false', () => {
		expect(passwordGenerator.generate({ numbers: false }))
			.to.be.a('string')
			.and.to.have.length(16);
	});

	it('Generate should generate a random string with symbols as false', () => {
		expect(passwordGenerator.generate({ symbols: false }))
			.to.be.a('string')
			.and.to.have.length(16);
	});
});
