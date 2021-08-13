/*eslint-env mocha*/
/*global assert*/

describe("e2e/06-bugs/111096-1", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a beacon (if ResourceTiming is enabled and PageFlo loaded in an IFRAME)", function() {
		if (t.isResourceTimingSupported() && PFLO.window !== PFLO.pflo_frame) {
			assert.notEqual(null, t.findResourceTimingBeacon());
		}
		else {
			return this.skip();
		}
	});

	it("Should not have used sendBeacon", function() {
		assert.isUndefined(tf.beacons[0].sb);
	});
});
