/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/29-opt-out-opt-in/06-opt-out-after-previous-opt-in", function() {

	var tf = PFLO.plugins.TestFramework;

	it("[After Opt-out] Should have set PFLO_CONSENT=\"opted-out\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("PFLO_CONSENT=\"opted-out\"") !== -1);
	});

	it("[Opt-out before PageFlo loaded] Should not have PFLO_CONSENT=\"opted-in\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("PFLO_CONSENT=\"opted-in\"") === -1);
	});

	it("[After Opt-out] Should have sent exactly 1 beacon because the rest were blocked because of Opt-out", function() {
		assert.isTrue(tf.beaconCount() === 1);
	});

});
