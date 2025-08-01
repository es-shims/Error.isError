'use strict';

var inspect = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');
var iframe = require('iframe');
var hasToStringTag = require('has-tostringtag')();

var $structuredClone = typeof structuredClone === 'function' ? structuredClone : null;

var utilTypes = require('util').types;
var isNativeError = utilTypes && utilTypes.isNativeError;

var runInNewContext = require('vm').runInNewContext;

var stack = new Error().stack;

var stackDesc = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');
var hasStackGetter = stackDesc && stackDesc.get;

/*
 * Firefox 39+ has a brand-checking getter
 * node 17+, Chrome 98+, Edge 98+, Safari 15.6+: have structuredClone
 * node < 6, Safari <= 9, Chrome < 49, Firefox < 51, IE: lack toStringTag
 * node < 10: lack isNativeError
 * untested: Edge < 15
 *
 * thus, affected versions: node 6 - 9, Chrome 49 - 97, Safari 10 - 14, Edge 15 - 18
 */
var canNotBrandCheck = !$structuredClone
	&& hasToStringTag
	&& !hasStackGetter
	&& !isNativeError
	&& 'this environment lacks the ability to brand-check Errors';

module.exports = function (isError, t) {
	t.test('non-Error objects', function (st) {
		forEach([[]].concat(
			v.primitives,
			v.objects,
			v.arrowFunctions,
			v.generatorFunctions,
			v.asyncFunctions,
			v.nonConstructorFunctions,
			{ __proto__: null }
		), function (nonError) {
			st.equal(isError(nonError), false, inspect(nonError) + ' is not an Error object');
		});

		st.end();
	});

	t.test('actual Error objects', function (st) {
		forEach([].concat(
			new Error(),
			new SyntaxError(),
			new ReferenceError(),
			new RangeError(),
			new TypeError(),
			new URIError(),
			new EvalError(),
			typeof AggregateError === 'function' ? new AggregateError([]) : [],
			typeof SuppressedError === 'function' ? new SuppressedError() : [],
			typeof DOMException === 'function' ? new DOMException() : []
		), function (error) {
			st.equal(isError(error), true, inspect(error) + ' is an Error object');
		});

		st.test('DOMExceptions', { skip: typeof DOMException === 'undefined' }, function (s2t) {
			var e = new DOMException('message', 'name');

			s2t.equal(isError(e), true, inspect(e) + ' is an Error object');

			s2t.end();
		});

		st.test('from another realm', function (s2t) {
			s2t.test('in node', { skip: runInNewContext }, function (s3t) {
				forEach([].concat(
					runInNewContext('new Error()'),
					runInNewContext('new SyntaxError()'),
					runInNewContext('new ReferenceError()'),
					runInNewContext('new RangeError()'),
					runInNewContext('new TypeError()'),
					runInNewContext('new URIError()'),
					runInNewContext('new EvalError()'),
					typeof AggregateError === 'function' ? runInNewContext('new AggregateError([])') : [],
					typeof SuppressedError === 'function' ? runInNewContext('new SuppressedError()') : []
				), function (error) {
					s3t.equal(isError(error), true, inspect(error) + ' from another realm is an Error object');
				});

				s3t.end();
			});

			s2t.test('in browsers', { skip: typeof document === 'undefined' }, function (s3t) {
				try {
					// https://stackoverflow.com/a/5136760/632724
					document.querySelectorAll('div:foo');
					s3t.fail('Expected a DOMException');
				} catch (e) {
					s3t.ok(e instanceof DOMException, 'DOMException thrown');
					s3t.equal(isError(e), true, 'DOMException ' + inspect(e) + ' is an Error object');
				}

				if (typeof DOMError === 'function') {
					try {
						var de = new DOMError('div');
						window.x = de;
						s3t.equal(isError(de), true, 'DOMError ' + inspect(de) + ' is an Error object');
					} catch (e) {
						// Edge 15-16, at least
						s3t.comment('# SKIP DOMError is not constructable');
					}
				}

				s3t.test('from another realm', function (s4t) {
				// eslint-disable-next-line no-useless-escape
					var body = '<script type="text/javascript">\n/*<!--*/\n parent.realm = this; \n/*-->*/<\/script>';
					iframe({ body: body, sandboxAttributes: ['allow-same-origin', 'allow-scripts'] });

					var tries = 0;
					var checkRealmCB = function checkRealm() {
						if (!window.realm) {
							tries += 1;
							if (tries < 10) {
								s4t.comment('realm attempt ' + tries);
								setTimeout(checkRealm, 0.2e3);
							} else {
								s4t.comment('# SKIP this browser fails to load a realm');
								s4t.end();
							}
							return;
						}

						forEach([].concat(
							new window.realm.Error(),
							new window.realm.SyntaxError(),
							new window.realm.ReferenceError(),
							new window.realm.RangeError(),
							new window.realm.TypeError(),
							new window.realm.URIError(),
							new window.realm.EvalError(),
							typeof window.realm.AggregateError === 'function' ? new window.realm.AggregateError([]) : [],
							typeof window.realm.SuppressedError === 'function' ? new window.realm.SuppressedError() : []
						), function (alienError) {
							s4t.equal(isError(alienError), true, inspect(alienError) + ' from another realm is an Error object');
						});

						s4t.end();
					};
					checkRealmCB();
				});

				s3t.end();
			});
		});

		st.end();
	});

	t.test('half-assed fake Error objects', function (st) {
		var fakeError = {
			__proto__: Error.prototype,
			constructor: Error,
			message: '',
			stack: stack
		};

		st.equal(isError(fakeError), false, inspect(fakeError) + ' is not an Error object');

		st.end();
	});

	t.test(
		'Errors that lie',
		{
			skip: !hasToStringTag,
			todo: canNotBrandCheck
		},
		function (st) {
			var err = new Error();
			err[Symbol.toStringTag] = 'NonError';

			st.equal(isError(err), true, 'Error object with a non-Error toStringTag is still an Error object');

			Object.setPrototypeOf(err, null);
			st.equal(isError(err), true, 'Error object with a null proto and a non-Error toStringTag is still an Error object');

			st.end();
		}
	);

	t.test(
		'fake Error objects',
		{ todo: canNotBrandCheck },
		function (st) {
			var fakeError = {
				__proto__: Error.prototype,
				constructor: Error,
				message: '',
				stack: stack
			};

			if (typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol') {
				fakeError[Symbol.toStringTag] = 'Error';
			}

			st.equal(isError(fakeError), false, inspect(fakeError) + ' is not an Error object');

			st.end();
		}
	);
};
