'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('generateNextChar', function() {
	it('generateNextChar function should exist', () => {
		expect(passwordGenerator).to.have.property('generateNextChar').with.is.a('function');
	});

	it('generateNextChar without Repetition', () => {
		var options = { allowRepetintion: false, numbers: true, symbols: false };

		expect(passwordGenerator.generateNextChar('1234', '123', options)).to.be.a('string').and.equal('4');
		expect(passwordGenerator.generateNextChar('1234', '123', options)).to.be.a('string').and.equal('4');
		expect(passwordGenerator.generateNextChar('1234', '123', options)).to.be.a('string').and.not.be.oneOf(['1', '2', '3']);
	});

	it('generateNextChar with Repetition', () => {
		var options = { allowRepetintion: true, numbers: true, symbols: false };

		expect(passwordGenerator.generateNextChar('abcd', 'abc', options)).to.be.a('string').and.be.oneOf(['a', 'b', 'c', 'd']);
		expect(passwordGenerator.generateNextChar('abc', '123', options)).to.be.a('string').and.be.oneOf(['a', 'b', 'c']);
		expect(passwordGenerator.generateNextChar('1234', '123', options)).to.be.a('string').and.be.oneOf(['1', '2', '3', '4']);
	});

	it('generateNextChar with Repetition and numbers and symbols', () => {
		var options = { allowRepetintion: true, numbers: 5, symbols: 5 };

		expect(passwordGenerator.generateNextChar('abcd', 'abc', options)).to.be.a('string').and.be.oneOf(['a', 'b', 'c', 'd']);
		expect(passwordGenerator.generateNextChar('abc', '123', options)).to.be.a('string').and.be.oneOf(['a', 'b', 'c']);
		expect(passwordGenerator.generateNextChar('1234', '123', options)).to.be.a('string').and.be.oneOf(['1', '2', '3', '4']);
	});
});
