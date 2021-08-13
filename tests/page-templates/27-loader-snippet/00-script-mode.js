/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/27-loader-snippet/00-script-mode", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a beacon", function() {
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have used the SCRIPT Snippet method (if IE 6 or IE 7)", function() {
		if (!t.isIE()) {
			return this.skip();
		}

		if (!navigator.userAgent.match(/MSIE [67]\./)) {
			return this.skip();
		}

		assert.isTrue(t.snippetWasLoadedScript());
	});

	it("Should have set sm=s (if IE 6 or IE 7)", function() {
		if (!t.isIE()) {
			return this.skip();
		}

		if (!navigator.userAgent.match(/MSIE [67]\./)) {
			return this.skip();
		}

		assert.equal("s", tf.lastBeacon().sm);
	});
});
