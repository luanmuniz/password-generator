'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('generateNextChar', function() {
	it('generateNextChar function should exist', () => {
		expect(passwordGenerator).to.have.property('generateNextChar').with.is.a('function');
	});
});
