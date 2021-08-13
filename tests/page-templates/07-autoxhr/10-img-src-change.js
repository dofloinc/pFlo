/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/07-autoxhr/10-img-src-change", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent 1 beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done,  1);
	});

	it("Should have removed event listeners from main-image (if MutationObserver is supported)", function() {
		if (t.isMutationObserverSupported()) {
			var img = document.getElementById("main-image");
			assert.equal(window.listenersAdded, 6);  // 3 load + 3 error listeners
			assert.equal(window.listenersRemoved, 6);
		}
		else {
			this.skip();
		}
	});
});
