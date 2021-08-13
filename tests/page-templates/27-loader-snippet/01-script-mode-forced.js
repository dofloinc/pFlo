/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/27-loader-snippet/01-script-mode-forced", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a beacon", function() {
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have used the SCRIPT Snippet method (if forcing the SCRIPT method is supported)", function() {
		if (!window.forcedSnippetScript) {
			return this.skip();
		}

		assert.isTrue(t.snippetWasLoadedScript());
	});

	it("Should have set sm=s (if forcing the SCRIPT method is supported)", function() {
		if (!window.forcedSnippetScript) {
			return this.skip();
		}

		assert.equal("s", tf.lastBeacon().sm);
	});

	it("Should not have used the IFRAME Snippet method (if forcing the SCRIPT method is supported)", function() {
		if (!window.forcedSnippetScript) {
			return this.skip();
		}

		assert.isFalse(t.snippetWasLoadedIframe());
	});

	it("Should not have used the Preload Snippet method", function() {
		assert.isFalse(t.snippetWasLoadedPreload());
	});

	it("Should have added a SCRIPT with id 'pflo-async' (if forcing the SCRIPT method is supported)", function() {
		if (!window.forcedSnippetScript) {
			return this.skip();
		}

		assert.isNotNull(t.findPageFloLoaderScript());
	});

	it("Should have added a SCRIPT to the same block (BODY) as the loader snippet (if not IE)", function() {
		if (window.isIE && !window.isEdge) {
			return this.skip();
		}

		assert.strictEqual(t.findPageFloLoaderScript().parentNode.tagName, "BODY");
	});

	it("Should have added a SCRIPT to the HEAD (if IE and if forcing the SCRIPT method is supported)", function() {
		if (!window.forcedSnippetScript) {
			return this.skip();
		}

		if (!window.isIE || window.isEdge) {
			return this.skip();
		}

		assert.strictEqual(t.findPageFloLoaderScript().parentNode.tagName, "HEAD");
	});
});
