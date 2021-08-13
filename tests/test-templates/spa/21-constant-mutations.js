/*eslint-env mocha*/
/*global PFLO_test,assert*/
PFLO_test.templates.SPA = PFLO_test.templates.SPA || {};
PFLO_test.templates.SPA["21-constant-mutations"] = function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have sent 1 beacon", function(done) {
		this.timeout(10000);
		t.ensureBeaconCount(done, 1);
	});

	it("Should have sent the beacon as http.initiator = spa_hard", function() {
		assert.equal(tf.beacons[0]["http.initiator"], "spa_hard");
	});

	it("Should have sent the first beacon for /21-constant-mutations.html", function() {
		var b = tf.beacons[0];
		assert.isTrue(b.u.indexOf("/21-constant-mutations.html") !== -1);
	});
};
