/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/14-errors/03-onerror", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;
	var C = PFLO.utils.Compression;


	it("Should have sent two beacons", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 2);
	});

	it("Should have only sent the 'BOOM2' beacon", function() {
		var b = tf.lastBeacon();
		var err = PFLO.plugins.Errors.decompressErrors(C.jsUrlDecompress(b.err))[0];
		assert.equal(err.message, "BOOM2");
	});
});
