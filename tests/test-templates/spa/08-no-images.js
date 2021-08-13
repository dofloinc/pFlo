/*eslint-env mocha*/
/*global PFLO_test,assert*/
PFLO_test.templates.SPA = PFLO_test.templates.SPA || {};
PFLO_test.templates.SPA["08-no-images"] = function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have only sent one beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 1);
	});

	it("Should take as long as the widgets.json take to load (if NavigationTiming is supported)", function() {
		if (typeof PFLO.plugins.RT.navigationStart() !== "undefined") {
			t.validateBeaconWasSentAfter(0, "widgets.json", 500, 0, 30000, true);
		}
		else {
			return this.skip();
		}
	});

	it("Shouldn't have a load time (if NavigationTiming is not supported)", function() {
		if (typeof PFLO.plugins.RT.navigationStart() === "undefined") {
			var b = tf.lastBeacon();
			assert.equal(b.t_done, undefined);
			assert.equal(b["rt.start"], "none");
		}
		else {
			return this.skip();
		}
	});
};
