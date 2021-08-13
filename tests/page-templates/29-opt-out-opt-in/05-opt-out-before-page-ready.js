/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/29-opt-out-opt-in/06-opt-out-before-page-ready", function() {

	var tf = PFLO.plugins.TestFramework;

	it("[Opt-out before PageFlo loaded] Should have 0 beacons sent", function() {
		assert.isTrue(tf.beaconCount() === 0);
	});

	it("[Opt-out before PageFlo loaded] Should have set PFLO_CONSENT=\"opted-out\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("PFLO_CONSENT=\"opted-out\"") !== -1);
	});

	it("[Opt-out before PageFlo loaded] Should not have PFLO_CONSENT=\"opted-in\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("PFLO_CONSENT=\"opted-in\"") === -1);
	});

});
