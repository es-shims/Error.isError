'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	if (
		!Error.isError
		|| (typeof DOMException === 'function' && !Error.isError(new DOMException()))
	) {
		return implementation;
	}
	return Error.isError;
};
