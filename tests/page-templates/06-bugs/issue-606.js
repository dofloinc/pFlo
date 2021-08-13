/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/06-bug/issue-606", function() {
	var t = PFLO_test;
	var tf = PFLO.plugins.TestFramework;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should only have one iframe and one CSS in the filter (if ResourceTiming is supported)", function() {
		if (t.isResourceTimingSupported()) {
			var b = tf.lastBeacon();

			var resources = ResourceTimingDecompression.decompressResources(JSON.parse(b.restiming));

			assert.equal(resources.length, 2);

			// find our iframe
			assert.equal(resources[0].initiatorType, "frame");
			assert.include(resources[0].name, "support/92542-iframe.html");

			// find our css
			assert.equal(resources[1].initiatorType, "css");
			assert.include(resources[1].name, "support/img.jpg");
		}
	});
});
