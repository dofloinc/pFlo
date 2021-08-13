/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/29-opt-out-opt-in/10-no-opt-in-config-before-onload", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should not have sent beacon", function() {
		assert.equal(tf.beaconCount(), 0);
	});

});
