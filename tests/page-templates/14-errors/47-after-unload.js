/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/14-errors/47-after-unload", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a single beacon", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have not generated an error after PageFlo was unloaded", function() {
		assert.isUndefined(window.onerrorHit);
	});
});
