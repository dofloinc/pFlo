/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/16-third-party-analytics/21-ibm-invalid", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should not have IBM Analytics Core ID", function() {
		var b = tf.lastBeacon();
		assert.equal(b["tp.cm.coreid"], undefined);
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
