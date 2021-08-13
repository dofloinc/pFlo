/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/25-cookie/15-session-expiry", function() {
	var tf = PFLO.plugins.TestFramework;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have a Session Expiry (se) of 100", function() {
		var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

		assert.equal(parseInt(cookie.se, 36), 100);
	});
});
