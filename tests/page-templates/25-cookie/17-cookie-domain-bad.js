/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/25-cookie/16-cookie-subdomain", function() {
	var tf = PFLO.plugins.TestFramework;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have only set a single cookie", function() {
		assert.equal(document.cookie.split("; ").length, 1);
	});

	it("Should have set the cookie on the current domain", function() {
		assert.isTrue(PFLO.utils.getCookie("RT").indexOf("dm=" + location.hostname) !== -1);
	});
});
