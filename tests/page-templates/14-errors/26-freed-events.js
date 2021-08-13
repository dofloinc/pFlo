/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/14-errors/26-freed-events", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	if (!window.addEventListener) {
		it("Skipping on browser that doesn't support addEventListener", function() {
			return this.skip();
		});

		return;
	}

	it("Should have only sent a page-load beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 1);
	});

	it("Should have no error on the page-load beacon", function() {
		var b = tf.lastBeacon();
		assert.isUndefined(b.err);
	});
});
