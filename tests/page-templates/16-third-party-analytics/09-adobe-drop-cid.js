/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/16-third-party-analytics/09-adobe-drop-cid", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should not have Adobe AID set", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.aa.aid"], undefined);
	});

	it("Should not have Adobe MID set", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.aa.mid"], undefined);
	});

	it("Should have Adobe Campaign ID set", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.aa.campaign"], "campaignid");
	});
});
