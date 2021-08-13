/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/16-third-party-analytics/11-google-invalid", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should not have Google Analytics Client ID", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.ga.clientid"], undefined);
	});

	it("Should not have an app error on the beacon", function() {
		var b = tf.lastBeacon();
		assert.equal(b.err, undefined);
	});

	it("Should not have a pflo error on the beacon", function() {
		var b = tf.lastBeacon();
		assert.equal(b.errors, undefined);
	});
});
