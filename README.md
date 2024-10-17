# Error.isError <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

An ESnext spec-compliant `Error.isError` shim/polyfill/replacement that works as far down as ES3.

This package implements the [es-shim API](https://github.com/es-shims/api) interface. It works in an ES3-supported environment and complies with the proposed [spec](https://tc39.github.io/proposal-array-grouping/).

## Getting started

```sh
npm install --save error.iserror
```

## Usage/Examples

```js
const isError = require('error.iserror');
var assert = require('assert');

assert.equal(isError(undefined), false);
assert.equal(isError(null), false);
assert.equal(isError({}), false);
assert.equal(isError([]), false);
assert.equal(isError(Error), false);
assert.equal(isError({ __proto__: Error.prototype, constructor: Error }), false);

assert.equal(isError(new Error()), true);
assert.equal(isError(new EvalError()), true);
assert.equal(isError(new RangeError()), true);
assert.equal(isError(new ReferenceError()), true);
assert.equal(isError(new SyntaxError()), true);
assert.equal(isError(new TypeError()), true);
assert.equal(isError(new URIError()), true);

if (typeof AggregateError === 'function') {
    assert.equal(isError(new AggregateError([])), true);
}
if (typeof SuppressedError === 'function') {
    assert.equal(isError(new SuppressedError()), true);
}

// note: engines that have `Symbol.toStringTag`, and lack structuredClone, and lack other brand-checking
// mechanisms, are only capable of brand-checking Error objects when they lack a `Symbol.toStringTag` property in their
// prototype chain. An object with it will give the wrong answer.
// This affects node 6 - 9, Chrome 49 - 97, Safari 10 - 14, Edge 15 - 18

assert.equal(isError({ __proto__: Error.prototype, constructor: Error, [Symbol.toStringTag]: 'Error' }), false);

const err = Object.assign(new Error(), { [Symbol.toStringTag]: 'Non-Error' });
Object.setPrototypeOf(err, null);
assert.equal(isError(err), true);
```

```js
var shimIsError = require('error.iserror/shim');
const getPolyfill = require('error.iserror/polyfill');
var assert = require('assert');
/* when Error.isError is not present */
delete Error.isError;
var shimmed = shimIsError();

assert.equal(shimmed, getPolyfill());
assert.deepEqual(Error.isError(new Error()), isError(new Error()));
```

```js
var shimIsError = require('error.iserror/shim');
var assert = require('assert');
/* when Error.isError is present */
var shimmed = shimIsError();

assert.equal(shimmed, Error.isError);
assert.deepEqual(Error.isError(new Error()), isError(new Error()));
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[package-url]: https://npmjs.org/package/error.iserror
[npm-version-svg]: https://versionbadg.es/es-shims/Error.isError.svg
[deps-svg]: https://david-dm.org/es-shims/Error.isError.svg
[deps-url]: https://david-dm.org/es-shims/Error.isError
[dev-deps-svg]: https://david-dm.org/es-shims/Error.isError/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/Error.isError#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/error.iserror.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/error.iserror.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/error.iserror.svg
[downloads-url]: https://npm-stat.com/charts.html?package=error.iserror
[codecov-image]: https://codecov.io/gh/es-shims/Error.isError/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/es-shims/Error.isError/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/es-shims/Error.isError
[actions-url]: https://github.com/es-shims/Error.isError/actions
