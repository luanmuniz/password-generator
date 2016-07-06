'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('shuffleString', function() {
	it('shuffleString function should exist', () => {
		expect(passwordGenerator).to.have.property('shuffleString').with.is.a('function');
	});

	it('shuffleString return is not equal to inicial string', () => {
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
		expect(passwordGenerator.shuffleString('abc')).to.be.a('string').and.not.equal('abc');
	});

});
