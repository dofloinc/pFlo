/*eslint-env mocha*/
/*global assert*/

describe("e2e/07-autoxhr/10-non-network-urls", function() {
	var t = PFLO_test;
	var tf = PFLO.plugins.TestFramework;

	it("Should get 1 beacons", function(done) {
		this.timeout(10000);
		t.ifAutoXHR(
			done,
			function() {
				t.ensureBeaconCount(done, 1);
			});
	});
});
