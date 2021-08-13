/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/22-early/04-prerender-config-after-onload", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent one beacons", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done,  1);
	});

	describe("Beacon 1 (page view)", function() {
		var i = 0;

		it("Should not be an early beacon", function() {
			var b = tf.beacons[i];
			assert.isUndefined(b.early);
		});

		// the following tests are only executed if mPulse's PageParams plugin exists
		if (PFLO.plugins.PageParams) {
			it("Should have a h.pg of MYPAGEGROUP", function() {
				var b = tf.beacons[i];
				assert.equal(b["h.pg"], "MYPAGEGROUP");
			});
		}
	});
});
