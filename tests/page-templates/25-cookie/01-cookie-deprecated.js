/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/25-cookie/01-cookie-deprecated", function() {
	var tf = PFLO.plugins.TestFramework;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should not have included Session History (rt.sh) in the cookie", function() {
		var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));
		assert.isUndefined(cookie.sh, "Session History should be removed");
	});
});
