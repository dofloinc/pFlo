/*eslint-env mocha*/
/*global PFLO_test,assert*/
PFLO_test.templates.SPA = PFLO_test.templates.SPA || {};
PFLO_test.templates.SPA["15-delayed-pflo"] = function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have only sent one beacon", function() {
		// only one beacon should've been sent
		assert.equal(tf.beacons.length, 1);
	});

	it("Should have sent a spa hard beacon", function() {
		// only one beacon should've been sent
		assert.equal(tf.beacons[0]["http.initiator"], "spa_hard");
	});
};
