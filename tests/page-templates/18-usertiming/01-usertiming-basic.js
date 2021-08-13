/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/18-usertiming/01-usertiming-basic", function() {
	var t = PFLO_test;
	var tf = PFLO.plugins.TestFramework;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have usertiming (if UserTiming is supported)", function() {
		if (t.isUserTimingSupported()) {
			var b = tf.beacons[0];
			assert.isString(b.usertiming);
			var data = UserTimingDecompression.decompressUserTiming(b.usertiming);
			var usertiming = {};
			assert.equal(data.length, 3);
			for (var i = 0; i < data.length; i++) {
				usertiming[data[i].name] = data[i];
			}
			assert.isTrue("mark1" in usertiming);
			assert.isTrue("mark2" in usertiming);
			assert.isTrue("measure1" in usertiming);
		}
	});
});
