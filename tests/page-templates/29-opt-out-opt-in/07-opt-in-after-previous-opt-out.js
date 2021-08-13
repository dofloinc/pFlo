/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/29-opt-out-opt-in/07-opt-in-after-previous-opt-out", function() {
	var tf = PFLO.plugins.TestFramework;

	var beaconCountBeforeOptIn = tf.beaconCount();

	it("[After Opt-out] Should have not sent beacons before visitor Opted In", function() {
		assert.isTrue(beaconCountBeforeOptIn === 0);
	});

	PFLO_OPT_IN();

	before("Give enough time to PageFlo to check if all plugins are ready", function(done) {
		this.timeout(2500);
		setTimeout(done, 2000);
	});

	it("[After Opt-out] Should have have set PFLO_CONSENT=\"opted-out\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("PFLO_CONSENT=\"opted-out\"") === -1);
	});

	it("[Opt-out before PageFlo loaded] Should have set PFLO_CONSENT=\"opted-in\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("PFLO_CONSENT=\"opted-in\"") !== -1);
	});

	it("[After Opt-out] Should have sent exactly 1 beacon after visitor Opted In", function() {
		assert.isTrue(tf.beaconCount() === 1);
	});

});
