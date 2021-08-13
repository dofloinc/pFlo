/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/25-cookie/12-cookie-from-previous-nav-click-non-nt", function() {
	var tf = PFLO.plugins.TestFramework;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	describe("Cookie", function() {
		it("Should have set the Compression Level (z)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isDefined(cookie.z);
		});

		it("Should have set the Session ID (si) of 'abc123-1234'", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.equal(cookie.si, "abc123-1234");
		});

		it("Should have a Session Length (sl) of 2", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.equal(parseInt(cookie.sl, 36), 2);
		});

		it("Should have a Session Start (ss) of around the last navigation", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.equal(parseInt(cookie.ss, 36), window.lastNav);
		});

		it("Should have a Total Time (tt) of the same duration as the navigation plus the last nav of 1000", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.equal(parseInt(cookie.tt, 36), tf.lastBeacon().t_done + 1000);
		});

		it("Should not have Off By One (obo) set", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.obo);
		});

		it("Should have set the Beacon URL (bcn)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.equal(cookie.bcn, "/beacon");
		});

		it("Should have set the Beacon Domain (dm)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.equal(cookie.dm, "pflo-test.local");
		});

		it("Should not have set Session Expiry (se)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.se);
		});

		it("Should not have set Rate Limited (rl)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.rl);
		});

		it("Should have set the Load Time (ld)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			var startTime = +(new Date());
			var ld = parseInt(cookie.ld, 36) + parseInt(cookie.ss, 36);

			// greater than 60 seconds ago
			assert.operator(ld, ">=", startTime - 60000);

			// not in the future
			assert.operator(ld, "<", startTime);
		});

		it("Should not have set Before Unload Time (ul)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.ul);
		});

		it("Should not have set Unload Time (hd)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.hd);
		});

		it("Should not have set Click Time (cl)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.cl);
		});

		it("Should not have set Referrer (r)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.r);
		});

		it("Should not have set New URL (nu)", function() {
			var cookie = PFLO.utils.getSubCookies(PFLO.utils.getCookie("RT"));

			assert.isUndefined(cookie.nu);
		});
	});

	describe("Beacon", function() {
		it("Should have set rt.start=cookie", function() {
			assert.equal(tf.lastBeacon()["rt.start"], "cookie");
		});

		it("Should have a navigation time (t_done) of around 9 seconds", function() {
			assert.closeTo(parseInt(tf.lastBeacon().t_done, 10), 9000, 2000);
		});

		it("Should have a navigation start time (rt.tstart) of around the cookie ul", function() {
			assert.equal(parseInt(tf.lastBeacon()["rt.tstart"], 10), window.lastUnload);
		});
	});
});
