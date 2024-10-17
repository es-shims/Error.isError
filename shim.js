'use strict';

var define = require('define-properties');

var getPolyfill = require('./polyfill');

module.exports = function shim() {
	var polyfill = getPolyfill();

	define(
		Error,
		{ isError: polyfill },
		{ isError: function () { return Object.isError !== polyfill; } }
	);

	return polyfill;
};
