/*eslint-env mocha*/
/*global PFLO_test*/
describe("e2e/12-react/104-hard-nav-onload-fired-xhr-after-load-pflo-delayed", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent one beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 1);
	});

	it("Should have sent the beacon as http.initiator = spa_hard", function() {
		assert.equal(tf.beacons[0]["http.initiator"], "spa_hard");
	});

	it("Should have beacon with a t_done of approximately NavTiming through the last IMG", function() {
		if (t.isMutationObserverSupported() && t.isNavigationTimingSupported() && t.isResourceTimingSupported()) {
			var img = t.findFirstResource("img.jpg&id=xhr");
			assert.closeTo(tf.beacons[0].t_done, img.responseEnd, 50);
		}
		else {
			this.skip();
		}
	});
});
