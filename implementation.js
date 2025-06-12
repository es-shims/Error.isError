'use strict';

var $Error = require('es-errors');
var hasToStringTag = require('has-tostringtag')();
var callBind = require('call-bind');
var callBound = require('call-bound');
var gOPD = require('gopd');

var isNativeError = require('./helpers/isNativeError');

var $structuredClone = typeof structuredClone === 'function' ? structuredClone : null;

var $toString = callBound('Object.prototype.toString');

var stackDesc = gOPD($Error.prototype, 'stack');
var stackGetter = stackDesc && stackDesc.get && callBind(stackDesc.get);

module.exports = function isError(arg) {
	if (!arg || (typeof arg !== 'object' && typeof arg !== 'function')) {
		return false; // step 1
	}

	if (isNativeError) { // node 10+
		return isNativeError(arg);
	}

	if ($structuredClone) {
		try {
			return $structuredClone(arg) instanceof $Error;
		} catch (e) {
			return false;
		}
	}

	if (!hasToStringTag || !(Symbol.toStringTag in arg)) {
		var str = $toString(arg);
		return str === '[object Error]' // errors
			|| str === '[object DOMException]' // browsers
			|| str === '[object DOMError]' // browsers, deprecated
			|| str === '[object Exception]'; // sentry
	}

	// Firefox
	if (stackGetter) {
		try {
			stackGetter(arg);
			return true;
		} catch (e) {
			return false;
		}
	}

	/* globals DOMError */
	if (typeof DOMError !== 'undefined' && arg instanceof DOMError) {
		// Edge 80
		return true;
	}

	// fallback for envs with toStringTag but without structuredClone
	return arg instanceof Error;
};
