'use strict';

var utilTypes = require('util').types;

/** @type {undefined | typeof import('util').types.isNativeError} */
module.exports = utilTypes && utilTypes.isNativeError;
