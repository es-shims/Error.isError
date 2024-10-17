'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return Error.isError || implementation;
};
