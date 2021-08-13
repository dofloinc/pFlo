/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/16-third-party-analytics/03-adobe-cookie-sfid", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have Adobe AID set (on a domain or in PhantomJS)", function() {
		if (t.canSetCookies()) {
			var b = tf.lastBeacon();
			assert.equal(b["tp.aa.aid"], "6B280792FE0CFE56-162DA99B1988A2F8");
		}
	});

	it("Should be missing Adobe AID (on localhost or an IP)", function() {
		if (!t.canSetCookies()) {
			var b = tf.lastBeacon();
			assert.equal(b["tp.aa.aid"], undefined);
		}
	});

	it("Should be missing Adobe MID", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.aa.mid"], undefined);
	});
});
