/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/21-continuity/04-epoch", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a single beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have set the epoch (c.e) to navigationStart (if NavigationTiming is supported)", function() {
		if (!t.isNavigationTimingSupported()) {
			return this.skip();
		}

		var b = tf.lastBeacon();

		assert.isDefined(b["c.e"]);

		assert.equal(parseInt(b["c.e"], 36), PFLO.plugins.RT.navigationStart());
	});

	it("Should have set the epoch (c.e) to something close to now (if NavigationTiming is not supported)", function() {
		if (t.isNavigationTimingSupported()) {
			return this.skip();
		}

		var b = tf.lastBeacon();

		assert.isDefined(b["c.e"]);

		assert.closeTo(parseInt(b["c.e"], 36), PFLO.now(), 3000);
	});
});
