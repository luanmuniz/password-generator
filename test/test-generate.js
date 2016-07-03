'use strict';

var expect = require('chai').expect;
var passwordGenerator = require('../index');

describe('generate', function() {
	it('Generate function should exist', () => {
		expect(passwordGenerator).to.have.property('generate').with.is.a('function');
	});
});
