/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/14-errors/13-settimeout", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;
	var C = PFLO.utils.Compression;

	if (typeof window.setTimeout === "object") {
		it("Skipping on IE <= 8, as setTimeout isn't overwritable easily", function() {
			return this.skip();
		});
		return;
	}

	it("Should have only sent one page load beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 1);
	});

	it("Should have put the err on the page load beacon", function() {
		var b = tf.lastBeacon();
		assert.isDefined(b.err);
	});

	it("Should have had a single error", function() {
		var b = tf.lastBeacon();
		assert.equal(PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err)).length, 1);
	});

	it("Should have count = 1", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.equal(err.count, 1);
	});

	it("Should have fileName of the page (if set)", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.fileName) {
			assert.include(err.fileName, window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1));
		}
		else {
			return this.skip();
		}
	});

	it("Should have functionName of 'errorFunction'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.functionName) {
			assert.include(err.functionName, "errorFunction");
		}
		else {
			return this.skip();
		}
	});

	it("Should have message = 'a is not defined' or 'Can't find variable: a' or ''a' is undefined'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		// Chrome, Firefox == a is not defined, Safari = Can't find variable, Edge = 'a' is not defined
		assert.isTrue(
			err.message.indexOf("a is not defined") !== -1 ||
			err.message.indexOf("Can't find variable: a") !== -1 ||
			err.message.indexOf("'a' is undefined") !== -1 ||
			err.message.indexOf("'a' is not defined") !== -1);
	});

	it("Should have source = APP", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.equal(err.source, PFLO.plugins.Errors.SOURCE_APP);
	});

	it("Should have stack with the stack", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.isDefined(err.stack);
	});

	it("Should have not have PFLO_plugins_errors_wrap on the stack", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.notInclude(err.stack, "PFLO_plugins_errors_wrap");
	});

	it("Should have type = 'ReferenceError' or 'Error'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.isTrue(err.type === "ReferenceError" || err.type === "Error");
	});

	it("Should have via = TIMEOUT", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.equal(err.via, PFLO.plugins.Errors.VIA_TIMEOUT);
	});

	it("Should have columNumber to be a number if specified", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		if (typeof err.columnNumber !== "undefined") {
			assert.isTrue(err.columnNumber >= 0);
		}
		else {
			return this.skip();
		}
	});

	it("Should have lineNumber ~ " + (HEADER_LINES + 14), function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.lineNumber) {
			assert.closeTo(err.lineNumber, HEADER_LINES + 14, 5);
		}
		else {
			return this.skip();
		}
	});

	it("Should have had 'bar' set on window", function() {
		assert.equal(window.bar, 1);
	});
});
