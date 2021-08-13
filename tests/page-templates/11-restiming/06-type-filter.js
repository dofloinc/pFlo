/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/11-restiming/06-type-filter", function() {
	var t = PFLO_test;
	var tf = PFLO.plugins.TestFramework;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should only have the one IMG in the filter (if ResourceTiming is supported)", function() {
		if (t.isResourceTimingSupported()) {
			var b = tf.lastBeacon();

			var resources = ResourceTimingDecompression.decompressResources(JSON.parse(b.restiming));

			// find our img
			assert.equal(resources.length, 1);
			assert.equal(resources[0].initiatorType, "img");
			assert.include(resources[0].name, "img.jpg");
		}
		else {
			this.skip();
		}
	});
});
