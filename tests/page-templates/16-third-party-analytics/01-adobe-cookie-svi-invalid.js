/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/16-third-party-analytics/01-adobe-cookie-svi-invalid", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should be missing Adobe AID", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.aa.aid"], undefined);
	});

	it("Should be missing Adobe MID", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.aa.mid"], undefined);
	});

});
