'use strict';

require('../auto');

var test = require('tape');
var defineProperties = require('define-properties');
var callBind = require('call-bind');
var functionsHaveNames = require('functions-have-names')();

var isEnumerable = Object.prototype.propertyIsEnumerable;

var runTests = require('./tests');

var name = 'isError';
var fullName = 'Error.' + name;

test('shimmed', function (t) {
	var fn = Error[name];

	t.equal(fn.length, 1, fullName + ' has a length of 1');

	t.test('Function name', { skip: !functionsHaveNames }, function (st) {
		st.equal(fn.name, name, fullName + ' has name "' + name + '"');
		st.end();
	});

	t.test('enumerability', { skip: !defineProperties.supportsDescriptors }, function (et) {
		et.equal(false, isEnumerable.call(Error, name), fullName + ' is not enumerable');
		et.end();
	});

	runTests(callBind(fn, Error), t);

	t.end();
});
