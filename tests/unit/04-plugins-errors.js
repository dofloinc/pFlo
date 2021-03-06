/*eslint-env mocha*/
/*global chai*/

describe("PFLO.plugins.Errors", function() {
	var assert = chai.assert;

	describe("exports", function() {
		it("Should have a Errors object", function() {
			assert.isObject(PFLO.plugins.Errors);
		});

		it("Should have a is_complete() function", function() {
			assert.isFunction(PFLO.plugins.Errors.is_complete);
		});

		it("Should be complete at this point", function() {
			assert.isTrue(PFLO.plugins.Errors.is_complete());
		});
	});

	describe("findDuplicateError()", function() {
		it("Should return a null when not given an array", function() {
			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError(null, {}));
			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError(undefined, {}));
			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError(false, {}));
			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError(1, {}));
			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError("s", {}));
		});

		it("Should return a null when not given an object", function() {
			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError([]));
			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError([], undefined));
		});

		it("Should find the same PageFloError object in the array", function() {
			var be = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var ary = [be];

			assert.equal(PFLO.plugins.Errors.findDuplicateError(ary, be), be);
		});

		it("Should find a PageFloError object with the same properties", function() {
			var be1 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var be2 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var ary = [be1];

			assert.equal(PFLO.plugins.Errors.findDuplicateError(ary, be2), be1);
		});

		it("Should not find anything when a PageFloError objects have different properties", function() {
			var be1 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var be2 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error1",
				functionName: "foo"
			});
			var ary = [be1];

			assert.isUndefined(PFLO.plugins.Errors.findDuplicateError(ary, be2));
		});
	});

	describe("mergeDuplicateErrors()", function() {
		it("Should not throw an error when not given an array", function() {
			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors(null, {}));
			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors(undefined, {}));
			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors(false, {}));
			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors(1, {}));
			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors("s", {}));
		});

		it("Should not modify the array when not given an object", function() {
			var ary = [];

			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors(ary));
			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors(ary, undefined));

			assert.deepEqual(ary, []);
		});

		it("Should increment the count of the same PageFloError object in the array", function() {
			var be = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var ary = [be];

			assert.equal(be.count, 1);

			assert.isDefined(PFLO.plugins.Errors.mergeDuplicateErrors(ary, be, true));

			assert.equal(be.count, 2);
		});

		it("Should increment the count of a PageFloError object with the same properties", function() {
			var be1 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var be2 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var ary = [be1];

			assert.equal(be1.count, 1);

			assert.isDefined(PFLO.plugins.Errors.mergeDuplicateErrors(ary, be2, true));

			assert.equal(be1.count, 2);
		});

		it("Should not increment the count when a PageFloError objects ahve different properties", function() {
			var be1 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error",
				functionName: "foo"
			});
			var be2 = new PFLO.plugins.Errors.PageFloError({
				code: 1,
				message: "error1",
				functionName: "foo"
			});
			var ary = [be1];

			assert.equal(be1.count, 1);

			assert.isUndefined(PFLO.plugins.Errors.mergeDuplicateErrors(ary, be2));

			assert.equal(be1.count, 1);
			assert.equal(be2.count, 1);
		});
	});

	describe("compressErrors()", function() {
		it("Should minimize a PageFloError that has no data", function() {
			var err = new PFLO.plugins.Errors.PageFloError();

			var c = PFLO.plugins.Errors.compressErrors([err])[0];

			assert.isUndefined(c.n);
			assert.isUndefined(c.f);
			assert.isUndefined(c.e);
			assert.isUndefined(c.s);
			assert.isUndefined(c.v);
			assert.isUndefined(c.t);
			assert.isUndefined(c.m);
			assert.isUndefined(c.c);
		});

		it("Should minimize a PageFloError that has defaults for via, source and type", function() {
			var err = new PFLO.plugins.Errors.PageFloError({
				via: PFLO.plugins.Errors.VIA_APP,
				source: PFLO.plugins.Errors.SOURCE_APP,
				type: "Error"
			});

			var c = PFLO.plugins.Errors.compressErrors([err])[0];

			assert.isUndefined(c.n);
			assert.isUndefined(c.f);
			assert.isUndefined(c.e);
			assert.isUndefined(c.s);
			assert.isUndefined(c.v);
			assert.isUndefined(c.t);
			assert.isUndefined(c.m);
			assert.isUndefined(c.c);
		});

		it("Should minimize a PageFloError that has values for everything", function() {
			var now = PFLO.now();

			var err = new PFLO.plugins.Errors.PageFloError({
				count: 2,
				frames: [{
					functionName: "Foo",
					lineNumber: 10,
					columnNumber: 10,
					fileName: "/foo.html"
				}],
				via: PFLO.plugins.Errors.VIA_CONSOLE,
				source: PFLO.plugins.Errors.SOURCE_BOOMERANG,
				type: "TypeError",
				message: "OHNO",
				code: 10,
				timestamp: now
			});

			var c = PFLO.plugins.Errors.compressErrors([err])[0];

			assert.equal(c.n, 2);

			var frame = c.f[0];
			assert.equal(frame.f, "Foo");
			assert.equal(frame.l, 10);
			assert.equal(frame.c, 10);
			assert.equal(frame.w, "/foo.html");

			assert.equal(c.s, PFLO.plugins.Errors.SOURCE_BOOMERANG);
			assert.equal(c.v, PFLO.plugins.Errors.VIA_CONSOLE);
			assert.equal(c.t, "TypeError");
			assert.equal(c.m, "OHNO");
			assert.equal(c.c, 10);
			assert.equal(c.d, now.toString(36));
		});
	});

	describe("decompressErrors()", function() {
		it("Should decompress a PageFloError that has no data", function() {
			var err = new PFLO.plugins.Errors.PageFloError();

			var c = PFLO.plugins.Errors.compressErrors([err])[0];
			var d = PFLO.plugins.Errors.decompressErrors([c])[0];

			assert.equal(d.count, 1);
			assert.equal(d.events.length, 0);
			assert.equal(d.frames.length, 0);
			assert.equal(d.source, PFLO.plugins.Errors.SOURCE_APP);
			assert.equal(d.stack, "");
			assert.equal(d.type, "Error");
			assert.equal(d.via, PFLO.plugins.Errors.VIA_APP);
		});

		it("Should decompress a PageFloError that has values for everything", function() {
			var err = new PFLO.plugins.Errors.PageFloError({
				count: 2,
				frames: [{
					functionName: "Foo",
					lineNumber: 10,
					columnNumber: 10,
					fileName: "/foo.html"
				}],
				via: PFLO.plugins.Errors.VIA_CONSOLE,
				source: PFLO.plugins.Errors.SOURCE_BOOMERANG,
				type: "TypeError",
				message: "OHNO",
				code: 10
			});

			var c = PFLO.plugins.Errors.compressErrors([err])[0];
			var d = PFLO.plugins.Errors.decompressErrors([c])[0];

			assert.equal(d.count, 2);
			assert.equal(d.events.length, 0);
			assert.equal(d.frames.length, 1);
			assert.equal(d.frames[0].functionName, "Foo");
			assert.equal(d.frames[0].lineNumber, 10);
			assert.equal(d.frames[0].columnNumber, 10);
			assert.equal(d.frames[0].fileName, "/foo.html");
			assert.equal(d.source, PFLO.plugins.Errors.SOURCE_BOOMERANG);
			assert.include(d.stack, "OHNO");
			assert.include(d.stack, "/foo.html");
			assert.include(d.stack, "Foo");
			assert.include(d.stack, "10:10");
			assert.equal(d.type, "TypeError");
			assert.equal(d.message, "OHNO");
			assert.equal(d.code, 10);
			assert.equal(d.via, PFLO.plugins.Errors.VIA_CONSOLE);
		});
	});

	describe("normalizeToString()", function() {
		it("Should return 'undefined' for undefined", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(), "undefined");
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(undefined), "undefined");
		});

		it("Should return 'null' for null", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(null), "null");
		});

		it("Should return '(empty string)' for an empty string", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(""), "(empty string)");
		});

		it("Should return the string for a string", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString("a"), "a");
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString("abc"), "abc");
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString("abc123"), "abc123");
		});

		it("Should return a number for a number", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(1), "1");
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(1.2), "1.2");
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(1000), "1000");
		});

		it("Should return '0' for 0", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(0), "0");
		});

		it("Should return 'false' for false", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(false), "false");
		});

		it("Should return 'NaN' for NaN", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(NaN), "NaN");
		});

		it("Should return '(function)' for a function", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(function(){}), "(function)");
		});

		it("Should return '' for an empty array", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString([]), "");
		});

		it("Should return '1' for an array with one element", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString([1]), "1");
		});

		it("Should return '1,2' for a an array with two elements", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString([1, 2]), "1,2");
		});

		it("Should return 'a' for a a string array", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(["a"]), "a");
		});

		it("Should return 'a,bc' for a a string array with two elements", function() {
			assert.strictEqual(PFLO.plugins.Errors.normalizeToString(["a", "bc"]), "a,bc");
		});
	});

	describe("PageFloError", function() {
		it("Should create an empty object when given no properties", function() {
			var be = new PFLO.plugins.Errors.PageFloError();

			assert.isUndefined(be.code);
			assert.isUndefined(be.message);
			assert.isUndefined(be.functionName);
			assert.isUndefined(be.fileName);
			assert.isUndefined(be.lineNumber);
			assert.isUndefined(be.columnNumber);
			assert.isUndefined(be.stack);
			assert.isUndefined(be.type);
			assert.isUndefined(be.via);

			// defaults
			assert.strictEqual(be.source, PFLO.plugins.Errors.SOURCE_APP);
			assert.deepEqual(be.events, []);
			assert.strictEqual(be.count, 1);
		});

		it("Should have the same properites as given", function() {
			var config = {
				code: 1,
				message: "a",
				functionName: "b",
				fileName: "c",
				lineNumber: 2,
				columnNumber: 3,
				stack: "d",
				type: "Error",
				via: 4,
				source: 5,
				events: [1, 2, 3]
			};

			var be = new PFLO.plugins.Errors.PageFloError(config);

			assert.strictEqual(be.code, 1);
			assert.strictEqual(be.message, "a");
			assert.strictEqual(be.functionName, "b");
			assert.strictEqual(be.fileName, "c");
			assert.strictEqual(be.lineNumber, 2);
			assert.strictEqual(be.columnNumber, 3);
			assert.strictEqual(be.stack, "d");
			assert.strictEqual(be.type, "Error");
			assert.strictEqual(be.via, 4);
			assert.strictEqual(be.source, 5);
			assert.deepEqual(be.events, [1, 2, 3]);
			assert.strictEqual(be.count, 1);
		});

		describe("equals()", function() {
			it("Should return true for two objects with the same properties", function() {
				var config = {
					code: 1,
					message: "a",
					functionName: "b",
					fileName: "c",
					lineNumber: 2,
					columnNumber: 3,
					stack: "d",
					type: 4,
					via: 5,
					source: 6,
					events: [1, 2, 3]
				};

				var be1 = new PFLO.plugins.Errors.PageFloError(config);
				var be2 = new PFLO.plugins.Errors.PageFloError(config);

				assert.strictEqual(be1.equals(be2), true);
				assert.strictEqual(be2.equals(be1), true);
			});

			it("Should return false if one property differs", function() {
				var config = {
					code: 1,
					message: "a",
					functionName: "b",
					fileName: "c",
					lineNumber: 2,
					columnNumber: 3,
					stack: "d",
					type: 4,
					via: 5,
					source: 6,
					events: [1, 2, 3]
				};

				var be1 = new PFLO.plugins.Errors.PageFloError(config);

				// change 1 property
				config.code = 2;
				var be2 = new PFLO.plugins.Errors.PageFloError(config);

				assert.strictEqual(be1.equals(be2), false);
				assert.strictEqual(be2.equals(be1), false);
			});

			it("Should return true if just the counts differ", function() {
				var config = {
					code: 1
				};

				var be1 = new PFLO.plugins.Errors.PageFloError(config);
				var be2 = new PFLO.plugins.Errors.PageFloError(config);

				be1.count = 2;

				assert.strictEqual(be1.equals(be2), true);
				assert.strictEqual(be2.equals(be1), true);
			});

			it("Should return true if just the events differ", function() {
				var config = {
					code: 1,
					events: []
				};

				var be1 = new PFLO.plugins.Errors.PageFloError(config);

				config.events = [1];
				var be2 = new PFLO.plugins.Errors.PageFloError(config);

				assert.strictEqual(be1.equals(be2), true);
				assert.strictEqual(be2.equals(be1), true);
			});
		});

		describe("fromError()", function() {
			it("Should return null if not given an error", function() {
				assert.strictEqual(PFLO.plugins.Errors.PageFloError.fromError(), null);
				assert.strictEqual(PFLO.plugins.Errors.PageFloError.fromError(null), null);
				assert.strictEqual(PFLO.plugins.Errors.PageFloError.fromError(undefined), null);
			});

			it("Should return an object if given an Error", function() {
				var err;
				var ln = 0;

				try {
					throw new Error("Test");
				}
				catch (err2) {
					err = err2;

					// 6 lines up
					ln = err.lineNumber ? (err.lineNumber - 6) : 0;
				}

				var be = PFLO.plugins.Errors.PageFloError.fromError(err, PFLO.plugins.Errors.VIA_APP, PFLO.plugins.Errors.SOURCE_APP);

				// character count may differ amongst browsers
				if (be.columnNumber) {
					assert.closeTo(be.columnNumber, 15, 15);
				}

				assert.strictEqual(be.count, 1);

				if (be.fileName) {
					assert.include(be.fileName, "04-plugins-errors");
				}

				// not all browsers will emit functionName
				if (be.functionName) {
					assert.isTrue(be.functionName.indexOf("Context.<anonymous>") !== -1 ||
						be.functionName.indexOf("context.<anonymous>") !== -1 ||
						be.functionName.indexOf("Anonymous") !== -1);
				}

				if (ln !== 0 && be.lineNumber) {
					assert.closeTo(be.lineNumber, ln, 10);
				}

				assert.strictEqual(be.message, "Test");
				assert.strictEqual(be.source, PFLO.plugins.Errors.SOURCE_APP);
				assert.strictEqual(be.type, "Error");

				if (be.stack) {
					assert.include(be.stack, "Test");
				}
			});

			it("Should strip PageFlo functions from an Error", function() {
				var stack = "Error: Test\n" +
							"    at okFunction1 (okFile1:1:1)\n" + // keep
							"    at okFunction2 (okFile2:2:2)\n" + // keep
							"    at createStackForSend (pflo:1)\n" +
							"    at PFLO.window.console.error (pflo:1)\n" +
							"    at PFLO.plugins.Errors.init (a.html:1)\n" +
							"    at PFLO.window.onerror (pflo:1)\n" +
							"    at PFLO_plugins_errors_console (pflo:1)\n" +
							"    at okFunction3 (okFile3:3:3)\n" + // keep
							"    at PFLO_plugins_errors_console (pflo:1)\n" +
							"    at okFunction4 (okFile4:4:4)\n" + // keep
							"    at Object.send (/a/pflo/b/:1:2)\n" +
							"    at wrap/< (/a/pflo/b/:1:2)\n" +
							"    at Anonymous function (/a/pflo/b/:1:2)\n" +
							"    at Object.send (/a/nopflo/b/:1:2)\n" + // keep
							"    at wrap/< (/a/nopflo/b/:1:2)"; // keep
				var err = {
					stack: stack
				};

				var parsed = PFLO.plugins.Errors.PageFloError.fromError(err);

				// only 4 frames should be left
				assert.equal(parsed.frames.length, 6);

				// first 4 matches are all okFunctionN at okFileN:N:n
				for (var i = 1; i <= 4; i++) {
					assert.equal(parsed.frames[i - 1].functionName, "okFunction" + i);
					assert.equal(parsed.frames[i - 1].fileName, "okFile" + i);
					assert.equal(parsed.frames[i - 1].lineNumber, i);
					assert.equal(parsed.frames[i - 1].columnNumber, i);
				}

				// then Object.send and wrap match
				assert.equal(parsed.frames[4].functionName, "Object.send");
				assert.equal(parsed.frames[4].fileName, "/a/nopflo/b/");
				assert.equal(parsed.frames[4].lineNumber, 1);
				assert.equal(parsed.frames[4].columnNumber, 2);

				assert.equal(parsed.frames[5].functionName, "wrap/<");
				assert.equal(parsed.frames[5].fileName, "/a/nopflo/b/");
				assert.equal(parsed.frames[5].lineNumber, 1);
				assert.equal(parsed.frames[5].columnNumber, 2);
			});
		});
	});
});
