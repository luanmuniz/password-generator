'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('checkForRepetintion', function() {
	it('checkForRepetintion function should exist', () => {
		expect(passwordGenerator).to.have.property('checkForRepetintion').with.is.a('function');
	});

	it('checkForRepetintion function work with alphabet characters', () => {
		expect(passwordGenerator.checkForRepetintion('abc', 'a')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('abc', 'b')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('abc', 'c')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('abc', 'd')).to.be.false;
	});

	it('checkForRepetintion function work with numbers characters', () => {
		expect(passwordGenerator.checkForRepetintion('123', '1')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('123', '2')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('123', '3')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('123', '4')).to.be.false;
	});

	it('checkForRepetintion function work with symbols characters', () => {
		expect(passwordGenerator.checkForRepetintion('!@#', '!')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('!@#', '@')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('!@#', '#')).to.be.true;
		expect(passwordGenerator.checkForRepetintion('!@#', '$')).to.be.false;
	});
});
