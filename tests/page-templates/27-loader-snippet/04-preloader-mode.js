/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/27-loader-snippet/04-preloader-mode", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a beacon", function() {
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have used the Preload Snippet method (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		assert.isTrue(t.snippetWasLoadedPreload());
	});

	it("Should have set sm=p (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		assert.equal("p", tf.lastBeacon().sm);
	});

	it("Should not have used the Preload Snippet method (if Preload is not supported)", function() {
		if (t.supportsPreload()) {
			return this.skip();
		}

		assert.isFalse(t.snippetWasLoadedPreload());
	});

	it("Should have added LINK rel 'preload' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var link = t.findPageFloLoaderLinkPreload();

		assert.equal("preload", link.rel);
	});

	it("Should have added LINK as 'script' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var link = t.findPageFloLoaderLinkPreload();

		assert.equal("script", link.as);
	});

	it("Should have added LINK to the same block (BODY) as the loader snippet (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var link = t.findPageFloLoaderLinkPreload();

		assert.equal(link.parentNode.tagName, "BODY");
	});

	it("Should have added SCRIPT id 'pflo-scr-as' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var script = t.findPageFloLoaderScriptPreload();

		assert.equal("pflo-scr-as", script.id);
	});

	it("Should have added SCRIPT async (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var script = t.findPageFloLoaderScriptPreload();

		assert.isTrue(script.async);
	});

	it("Should have added SCRIPT to the same block (BODY) as the loader snippet (if Preload is supported )", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var script = t.findPageFloLoaderScriptPreload();

		assert.equal(script.parentNode.tagName, "BODY");
	});
});
