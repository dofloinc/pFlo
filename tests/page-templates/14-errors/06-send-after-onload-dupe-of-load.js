/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/14-errors/06-send-after-onload-dupe-of-load", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;
	var C = PFLO.utils.Compression;

	it("Should have sent a single beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 1);
	});

	it("Should have put the err on the beacon", function() {
		var b = tf.lastBeacon();
		assert.isDefined(b.err);
	});

	it("Should have had a single error", function() {
		var b = tf.lastBeacon();
		assert.equal(C.jsUrlDecompress(b.err).length, 1);
	});

	it("Should have count = 1", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.isTrue(err.count >= 2, "err.count >= 2");
	});

	it("Should have fileName of the page (if set)", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.fileName) {
			assert.include(err.fileName, "06-send-after-onload-dupe-of-load.html");
		}
		else {
			return this.skip();
		}
	});

	it("Should have functionName of 'errorFunction'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.functionName) {
			assert.equal(err.functionName, "errorFunction");
		}
		else {
			return this.skip();
		}
	});

	it("Should have message = 'ERROR!'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.equal(err.message, "ERROR!");
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

	it("Should have type = 'Error'", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.equal(err.type, "Error");
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

	it("Should have lineNumber ~ " + (HEADER_LINES + 3), function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];

		if (err.lineNumber) {
			assert.closeTo(err.lineNumber, HEADER_LINES + 3, 5);
		}
		else {
			return this.skip();
		}
	});
});
