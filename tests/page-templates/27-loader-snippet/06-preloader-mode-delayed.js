/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/27-loader-snippet/06-preloader-mode-delayed", function() {
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

	it("Should have set sm=if (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		assert.equal("if", tf.lastBeacon().sm);
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

	it("Should not have added SCRIPT id 'pflo-scr-as' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		assert.isNull(t.findPageFloLoaderScriptPreload());
	});

	it("Should have added a IFRAME with src 'about:blank' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.equal("about:blank", iframe.src);
	});

	it("Should have added a IFRAME to the same block (BODY) as the loader snippet (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.equal(iframe.parentNode.tagName, "BODY");
	});

	it("Should have added a IFRAME with title '' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.strictEqual(iframe.title, "");
	});

	it("Should have added a IFRAME with role 'presentation' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.equal(iframe.role, "presentation");
	});

	it("Should have added a IFRAME with width 0 (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.equal(iframe.width, 0);
	});

	it("Should have added a IFRAME with height 0 (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.equal(iframe.height, 0);
	});

	it("Should have added a IFRAME with border '0px' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.include(iframe.style.border, "0px");
	});

	it("Should have added a IFRAME with display 'none' (if Preload is supported)", function() {
		if (!t.supportsPreload()) {
			return this.skip();
		}

		var iframe = t.findPageFloLoaderFrame();

		assert.equal(iframe.style.display, "none");
	});
});
