/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/14-errors/27-freed-timeout", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have only sent a page-load beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 1);
	});

	it("Should have no error on the page-load beacon", function() {
		var b = tf.lastBeacon();
		assert.isUndefined(b.err);
	});
});
