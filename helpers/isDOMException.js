'use strict';

var gOPD = require('gopd');
var callBind = require('call-bind');

var getDOMException = typeof DOMException === 'function' && gOPD(DOMException.prototype, 'name').get;
var getDOMExceptionB = getDOMException && callBind(getDOMException);

module.exports = getDOMExceptionB && function isDOMException(arg) {
	if (!arg || typeof arg !== 'object') {
		return false;
	}
	try {
		getDOMExceptionB(arg);
		return true;
	} catch (e) {
		return false;
	}
};
