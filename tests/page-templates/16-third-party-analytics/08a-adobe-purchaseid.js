/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/16-third-party-analytics/08a-adobe-purchaseid", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have Adobe Purchase ID set", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.aa.purchaseid"], "purchaseid");
	});
});
