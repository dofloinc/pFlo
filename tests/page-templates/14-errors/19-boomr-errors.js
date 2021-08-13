/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/14-errors/19-pflo-errors", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;
	var C = PFLO.utils.Compression;

	it("Should have sent a single beacon", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have put the err on the beacon", function() {
		var b = tf.lastBeacon();
		assert.isDefined(b.err);
	});

	it("Should have had 4 errors", function() {
		var b = tf.lastBeacon();
		assert.equal(C.jsUrlDecompress(b.err).length, 4);
	});

	it("Should have each error with a count = 1", function() {
		var b = tf.lastBeacon();
		var errs = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err));

		for (var i = 0; i < errs.length; i++) {
			assert.equal(errs[i].count, 1);
		}
	});

	it("Should have fileName of the page (if set)", function() {
		var b = tf.lastBeacon(), found = false;
		var errs = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err));
		for (var i = 0; i < errs.length; i++) {
			if (errs[i].fileName) {
				assert.include(errs[i].fileName, window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1));
				found = true;
			}
		}
		if (!found) {
			return this.skip();
		}
	});

	it("Should have error #1 functionName of 'errorFunction'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.functionName) {
			assert.include(err.functionName, "errorFunction");
		}
		else {
			return this.skip();
		}
	});

	it("Should have error #2 functionName of 'PFLOtest2'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[1];

		if (err.functionName) {
			assert.include(err.functionName, "PFLOtest2");
		}
		else {
			return this.skip();
		}
	});

	it("Should have error #3 functionName of 'PFLOtest3'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[2];

		if (err.functionName) {
			assert.include(err.functionName, "PFLOtest3");
		}
		else {
			return this.skip();
		}
	});

	it("Should have error #4 functionName of 'PFLOtest4'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[3];

		if (err.functionName) {
			assert.include(err.functionName, "PFLOtest4");
		}
		else {
			return this.skip();
		}
	});

	it("Should have error #1 message", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.isDefined(err.message);
	});

	it("Should have error #2 message = 'Fault 2'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[1];
		assert.equal(err.message, "Fault 2");
	});

	it("Should have error #3 message = 'Fault 3'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[2];
		assert.equal(err.message, "Fault 3");
	});

	it("Should have error #4 message = 'Fault 4'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[3];
		assert.equal(err.message, "Fault 4");
	});

	it("Should have source = BOOMERANG", function() {
		var b = tf.lastBeacon();
		var errs = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err));

		for (var i = 0; i < errs.length; i++) {
			assert.equal(errs[i].source, PFLO.plugins.Errors.SOURCE_BOOMERANG);
		}
	});

	it("Should have stack with the stack", function() {
		var b = tf.lastBeacon();
		var errs = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err));

		for (var i = 0; i < errs.length; i++) {
			assert.isDefined(errs[i].stack);
		}
	});

	it("Should have not have PFLO_plugins_errors_wrap on the stack", function() {
		var b = tf.lastBeacon();
		var errs = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err));

		for (var i = 0; i < errs.length; i++) {
			assert.notInclude(errs[i].stack, "PFLO_plugins_errors_wrap");
		}
	});

	it("Should have not have PFLO_addError on the stack", function() {
		var b = tf.lastBeacon();
		var errs = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err));

		for (var i = 0; i < errs.length; i++) {
			assert.notInclude(errs[i].stack, "PFLO_addError");
		}
	});

	it("Should have via = APP", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.equal(err.via, PFLO.plugins.Errors.VIA_APP);
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

	it("Should have lineNumber ~ " + (HEADER_LINES + 15), function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.lineNumber) {
			assert.closeTo(err.lineNumber, HEADER_LINES + 15, 5);
		}
		else {
			return this.skip();
		}
	});
});
