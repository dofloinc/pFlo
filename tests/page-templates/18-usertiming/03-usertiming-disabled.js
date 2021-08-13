/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/18-usertiming/03-usertiming-disabled", function() {
	var t = PFLO_test;
	var tf = PFLO.plugins.TestFramework;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should not have usertiming", function() {
		if (t.isUserTimingSupported()) {
			var b = tf.beacons[0];
			assert.equal(b.usertiming, undefined);
		}
	});
});
