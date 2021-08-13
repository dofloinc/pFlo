/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/21-continuity/36-cls", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have set c.cls (if PerformanceObserver is supported)", function(done) {
		if (!typeof PFLO.window.PerformanceObserver === "function" || !PFLO.window.LayoutShift) {
			return this.skip();
		}

		assert.isNumber(tf.lastBeacon()["c.cls"]);
		assert.equal(tf.lastBeacon()["c.cls"], clsScoreOnBeaconSend);
		done();
	});
});
