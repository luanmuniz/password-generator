'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('checkForRepetintion', function() {
	it('checkForRepetintion function should exist', () => {
		expect(passwordGenerator).to.have.property('checkForRepetintion').with.is.a('function');
	});
});
