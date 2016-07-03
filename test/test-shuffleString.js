'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('shuffleString', function() {
	it('shuffleString function should exist', () => {
		expect(passwordGenerator).to.have.property('shuffleString').with.is.a('function');
	});
});
