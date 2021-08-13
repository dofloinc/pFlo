/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/12-react/111-route-change-fetch", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	if (t.isFetchApiSupported()) {
		PFLO_test.templates.SPA["04-route-change"]();

		it("Should have sent the second beacon with a duration of between 2 and 3 seconds", function() {
			assert.operator(tf.beacons[1].t_done, ">=", 2000);
			assert.operator(tf.beacons[1].t_done, "<=", 3000);
		});
	}
	else {
		it.skip("Should only run tests if Fetch API is supported");
	}
});
