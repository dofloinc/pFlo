/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/19-navtiming/02-front-end-back-end", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have Front-End time (t_page) on the beacon (if NavigationTiming is supported)", function() {
		if (!t.isNavigationTimingSupported()) {
			return this.skip();
		}

		assert.isNumber(tf.lastBeacon().t_page);
	});

	it("Should not have Front-End time (t_page) on the beacon (if NavigationTiming is not supported)", function() {
		if (t.isNavigationTimingSupported()) {
			return this.skip();
		}

		assert.isUndefined(tf.lastBeacon().t_page);
	});

	it("Should have Back-End time (t_resp) on the beacon (if NavigationTiming is supported)", function() {
		if (!t.isNavigationTimingSupported()) {
			return this.skip();
		}

		assert.isNumber(tf.lastBeacon().t_resp);
	});

	it("Should not have Back-End time (t_resp) on the beacon (if NavigationTiming is not supported)", function() {
		if (t.isNavigationTimingSupported()) {
			return this.skip();
		}

		assert.isUndefined(tf.lastBeacon().t_resp);
	});

	it("Should have Back-End time + Front-End time equal Page Load time (t_resp + t_page = t_done) on the beacon (if NavigationTiming is supported)", function() {
		if (!t.isNavigationTimingSupported()) {
			return this.skip();
		}

		var fe = parseInt(tf.lastBeacon().t_page, 10);
		var be = parseInt(tf.lastBeacon().t_resp, 10);
		var tt = parseInt(tf.lastBeacon().t_done, 10);

		assert.equal(fe + be, tt);
	});
});
