/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/25-cookie/07-cookie-referrer-non-nt", function() {
	var tf = PFLO.plugins.TestFramework;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have set Referrer (r)", function() {
		var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

		assert.equal(cookie.r, PFLO.utils.hashString(document.URL));
	});
});
