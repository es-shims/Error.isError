'use strict';

var $Error = require('es-errors');
var hasToStringTag = require('has-tostringtag')();
var callBind = require('call-bind');
var callBound = require('call-bind/callBound');
var gOPD = require('gopd');
var isNativeError = require('./helpers/isNativeError');

var $structuredClone = typeof structuredClone === 'function' ? structuredClone : null;

var $toString = callBound('Object.prototype.toString');

var stackDesc = gOPD($Error.prototype, 'stack');
var stackGetter = stackDesc && stackDesc.get && callBind(stackDesc.get);

var domExceptionClonable = !!($structuredClone && $structuredClone(new DOMException()) instanceof $Error);

module.exports = function isError(arg) {
	if (!arg || (typeof arg !== 'object' && typeof arg !== 'function')) {
		return false; // step 1
	}

	if ($structuredClone) {
		try {
			if ($structuredClone(arg) instanceof $Error) {
				return true;
			} else if (domExceptionClonable) {
				return false;
			}
		} catch (e) {
			return false;
		}
	}

	if (isNativeError && isNativeError(arg)) { // node 10+
		return true;
	}

	var str = $toString(arg);

	if (
		str === '[object DOMException]' // browsers
		|| ((!hasToStringTag || !(Symbol.toStringTag in arg))
			&& (
				str === '[object DOMError]' // browsers, deprecated
				|| str === '[object Exception]' // sentry
			)
		)
	) {
		return true;
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
