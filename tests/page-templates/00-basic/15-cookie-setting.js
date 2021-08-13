/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/00-basic/15-cookie-setting", function() {
	var tf = PFLO.plugins.TestFramework;
	var t = PFLO_test;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have only read the cookie twice during init (if there is one init)", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		if (t.findPageFloMarks("init:start").length !== 1) {
			return this.skip();
		}

		assert.equal(
			2,
			t.findPageFloMarksBetween(
				"get_raw_cookie",
				t.findPageFloMarks("init:start")[0],
				t.findPageFloMarks("init:end")[0]
			).length);
	});

	it("Should have only set the cookie once during init (if there is one init)", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		if (t.findPageFloMarks("init:start").length !== 1) {
			return this.skip();
		}

		assert.equal(
			1,
			t.findPageFloMarksBetween(
				"set_cookie_real",
				t.findPageFloMarks("init:start")[0],
				t.findPageFloMarks("init:end")[0]
			).length);
	});

	it("Should have only read the cookie once during first init (if there are two inits)", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		if (t.findPageFloMarks("init:start").length !== 2) {
			return this.skip();
		}

		assert.equal(
			1,
			t.findPageFloMarksBetween(
				"get_raw_cookie",
				t.findPageFloMarks("init:start")[0],
				t.findPageFloMarks("init:end")[0]
			).length);
	});

	it("Should not have set the cookie during first init (if there are two inits)", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		if (t.findPageFloMarks("init:start").length !== 2) {
			return this.skip();
		}

		assert.equal(
			0,
			t.findPageFloMarksBetween(
				"set_cookie_real",
				t.findPageFloMarks("init:start")[0],
				t.findPageFloMarks("init:end")[0]
			).length);
	});

	it("Should have only read the cookie once during second init call (if there are two inits)", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		if (t.findPageFloMarks("init:start").length !== 2) {
			return this.skip();
		}

		assert.equal(
			1,
			t.findPageFloMarksBetween(
				"get_raw_cookie",
				t.findPageFloMarks("init:start")[1],
				t.findPageFloMarks("init:end")[1]
			).length);
	});

	it("Should have only set the cookie once during second init call (if there are two inits)", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		if (t.findPageFloMarks("init:start").length !== 2) {
			return this.skip();
		}

		assert.equal(
			1,
			t.findPageFloMarksBetween(
				"set_cookie_real",
				t.findPageFloMarks("init:start")[1],
				t.findPageFloMarks("init:end")[1]
			).length);
	});

	it("Should not have read the cookie during load", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			0,
			t.findPageFloMarksBetween(
				"get_raw_cookie",
				t.findPageFloMarks("fire_event:page_ready:start")[0],
				t.findPageFloMarks("fire_event:page_ready:end")[0]
			).length);
	});

	it("Should have only set the cookie once during load", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			1,
			t.findPageFloMarksBetween(
				"set_cookie_real",
				t.findPageFloMarks("fire_event:page_ready:start")[0],
				t.findPageFloMarks("fire_event:page_ready:end")[0]
			).length);
	});

	it("Should not have read the cookie during sendBeacon", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			0,
			t.findPageFloMarksBetween(
				"get_raw_cookie",
				t.findPageFloMarks("send_beacon:start")[0],
				t.findPageFloMarks("send_beacon:end")[0]
			).length);
	});

	it("Should not have set cookie during sendBeacon", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			0,
			t.findPageFloMarksBetween(
				"set_cookie_real",
				t.findPageFloMarks("send_beacon:start")[0],
				t.findPageFloMarks("send_beacon:end")[0]
			).length);
	});

	it("Should not have read the cookie once during unload", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			0,
			t.findPageFloMarksBetween(
				"get_raw_cookie",
				t.findPageFloMarks("fire_event:page_unload:start")[0],
				t.findPageFloMarks("fire_event:page_unload:end")[0]
			).length);
	});

	it("Should have only set the cookie once during unload", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			1,
			t.findPageFloMarksBetween(
				"set_cookie_real",
				t.findPageFloMarks("fire_event:page_unload:start")[0],
				t.findPageFloMarks("fire_event:page_unload:end")[0]
			).length);
	});

	it("Should have only read the cookie 2 times total", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			2,
			t.findPageFloMarks("get_raw_cookie").length);
	});

	it("Should have only set the cookie 3 times total", function() {
		// We use UserTiming to measure marks
		if (!t.isUserTimingSupported()) {
			return this.skip();
		}

		assert.equal(
			3,
			t.findPageFloMarks("set_cookie_real").length);
	});
});
