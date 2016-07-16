'use strict';

var expect = require('chai').expect;
var rewire = require('rewire');
var PasswordGenerator = rewire('../index').__get__('PasswordGenerator');

describe('checkForRepetintion', function() {
	it('checkForRepetintion function should exist', () => {
		expect(PasswordGenerator).to.have.property('checkForRepetintion').with.is.a('function');
	});

	it('checkForRepetintion function work with alphabet characters', () => {
		expect(PasswordGenerator.checkForRepetintion('abc', 'a')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('abc', 'b')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('abc', 'c')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('abc', 'd')).to.be.false;
	});

	it('checkForRepetintion function work with numbers characters', () => {
		expect(PasswordGenerator.checkForRepetintion('123', '1')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('123', '2')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('123', '3')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('123', '4')).to.be.false;
	});

	it('checkForRepetintion function work with symbols characters', () => {
		expect(PasswordGenerator.checkForRepetintion('!@#', '!')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('!@#', '@')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('!@#', '#')).to.be.true;
		expect(PasswordGenerator.checkForRepetintion('!@#', '$')).to.be.false;
	});
});
