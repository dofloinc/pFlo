/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/03-load-order/02-after-page-load-tag-manager", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should contain PFLO.url set to pflo's URL", function() {
		assert.isString(PFLO.url, "is not a string");
		assert.match(PFLO.url, /\/pflo-latest-debug.js($|\?|&)/, "does not match: " + PFLO.url);
	});

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have a end timestamp equal to NavigationTiming's loadEventEnd timestamp (if NavTiming supported)", function() {
		var b = tf.lastBeacon();
		if (window.performance && window.performance.timing) {
			assert.equal(b["rt.end"], window.performance.timing.loadEventEnd);
		}
		else {
			return this.skip();
		}
	});

	it("Should have a end timestamp after the loader start timestamp (if NavTiming not supported)", function() {
		var b = tf.lastBeacon();
		if (!(window.performance && window.performance.timing)) {
			assert.operator(b["rt.end"], ">=", PFLO.t_lstart);
		}
		else {
			return this.skip();
		}
	});

	it("Should have a end timestamp before the PageFlo start timestamp (if NavTiming not supported)", function() {
		var b = tf.lastBeacon();
		if (!(window.performance && window.performance.timing)) {
			assert.operator(b["rt.end"], "<=", PFLO.t_start);
		}
		else {
			return this.skip();
		}
	});

	it("Should have a end timestamp before now (if NavTiming not supported)", function() {
		var b = tf.lastBeacon();
		var now = +(new Date());
		if (!(window.performance && window.performance.timing)) {
			assert.operator(b["rt.end"], "<=", now);
		}
		else {
			return this.skip();
		}
	});

	it("Should have a end timestamp equal to PFLO.t_onload (if NavTiming not supported)", function() {
		var b = tf.lastBeacon();
		if (!(window.performance && window.performance.timing)) {
			assert.equal(b["rt.end"], PFLO.t_onload);
		}
		else {
			return this.skip();
		}
	});
});
