/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils cookies", function() {
	var assert = chai.assert;

	var cookieName = "myCookie";

	/*
		NOTE:

		These tests can only run in a client-server setup with a properly
		configured FQDN for the server.

		Please read:
			RFC 2109 (https://www.ietf.org/rfc/rfc2109.txt)
		and this thread on the chromium bugtracker:
			https://code.google.com/p/chromium/issues/detail?id=535

		In your development environment please configure your localhost with a fully
		qualified domain name locally:

		In a UNIX/Mac/Linux environment you can add a name for 127.0.0.1 to
		your /etc/hosts such as:
			127.0.0.1	www.example.org  www

		You can do the same under windows, however the path to the file is a
		little different:

		Valid for Windown Vista/7/2008/2012: C:\Windows\System32\drivers\etc\hosts

		We (as in the pflo team) are not responsible for any accidental or
		direct damages and or damage claims. See LICENSE for further information.
	*/

	if (window.location.protocol === "file:") {
		return;
	}

	// need to skip some tests this isn't on a TLD (eg localhost), because cookies can't get set
	var canSetCookies = window.location.host.indexOf(".") !== -1;

	// cookie domain can't have a port
	var cookieDomain = window.location.host.indexOf(":") === -1 ?
		window.location.host :
		window.location.host.substring(0, window.location.host.indexOf(":"));

	describe("PFLO.utils.getCookie()", function() {
		it("Should have an exisiting PFLO.utils.getCookie function", function() {
			assert.isFunction(PFLO.utils.getCookie);
		});

		it("Should return null when calling getCookie() with empty arguments", function() {
			assert.isNull(PFLO.utils.getCookie());
		});

		it("Should return null when calling getCookie with empty String", function() {
			assert.isNull(PFLO.utils.getCookie(""));
		});

		it("Should return null when calling with null as first argument", function() {
			assert.isNull(PFLO.utils.getCookie(null));
		});

		it("Should return false when calling with non existing cookie", function() {
			assert.isUndefined(PFLO.utils.getCookie("some-non-existing-cooke"));
		});
	});

	describe("PFLO.utils.setCookie()", function() {
		it("Should have an exisiting PFLO.utils.setCookie function", function() {
			PFLO.session.domain = cookieDomain;

			assert.isFunction(PFLO.utils.setCookie);
		});

		it("Should return false if no domain is set", function()  {
			PFLO.session.domain = null;

			assert.isFalse(PFLO.utils.setCookie());
			assert.isFalse(PFLO.utils.setCookie(cookieName));
		});

		it("Should return false if no name was passed as first argument to setCookie()", function()  {
			PFLO.session.domain = cookieDomain;

			assert.isFalse(PFLO.utils.setCookie());
		});

		if (canSetCookies) {
			it("Should return false when setting only Cookie name", function() {
				PFLO.session.domain = cookieDomain;

				assert.isFalse(PFLO.utils.setCookie(cookieName));
			});

			it("Should return true when setting Cookie with value", function() {
				PFLO.session.domain = cookieDomain;

				assert.isTrue(PFLO.utils.setCookie(cookieName, "value"));
			});

			it("Should return the cookie value string that we've set previously", function() {
				PFLO.session.domain = cookieDomain;

				var value = "value";
				PFLO.utils.setCookie(cookieName, value);

				assert.equal(PFLO.utils.getCookie(cookieName), value);
				PFLO.utils.removeCookie(cookieName);
			});

			it("Should return the EXACT value string that we've set previously", function() {
				PFLO.session.domain = cookieDomain;

				var value = "1";
				var value_strict_false = 1;

				PFLO.utils.setCookie(cookieName, value);
				assert.strictEqual(PFLO.utils.getCookie(cookieName), value);
				assert.notStrictEqual(PFLO.utils.getCookie(cookieName), value_strict_false);
				PFLO.utils.removeCookie(cookieName);
			});

			it("Should return the cookie value string that we've set previously with a large expiry", function() {
				PFLO.session.domain = cookieDomain;

				var value = "1";
				PFLO.utils.setCookie(cookieName, value, 5 * 60);
				assert.strictEqual(PFLO.utils.getCookie(cookieName), value);
				PFLO.utils.removeCookie(cookieName);
			});

			it("Should return undefined for a cookie that we've set previously with a zero expiry", function() {
				PFLO.session.domain = cookieDomain;

				var value = "1";
				PFLO.utils.setCookie(cookieName, value, 0);
				assert.isUndefined(PFLO.utils.getCookie(cookieName));
			});

			it("Should return undefined for a cookie that we've set previously with a negative expiry", function() {
				PFLO.session.domain = cookieDomain;

				var value = "1";
				PFLO.utils.setCookie(cookieName, value, -1);
				assert.isUndefined(PFLO.utils.getCookie(cookieName));
			});
		}

		it("Should return false when trying to set a cookie bigger than 500 characters", function() {
			PFLO.session.domain = cookieDomain;

			var value = "";
			for (var index = 0; index <= 500; index++) {
				value += "1";
			}

			assert.isFalse(PFLO.utils.setCookie("failCookie", value));
		});
	});

	describe("PFLO.utils.getSubCookies()", function() {
		it("Should have an exisiting PFLO.utils.getSubCookies function", function() {
			assert.isFunction(PFLO.utils.getSubCookies);
		});

		it("Should return null when calling getSubCookies() with empty arguments", function() {
			assert.isNull(PFLO.utils.getSubCookies());
		});

		it("Should return null when calling getSubCookies with empty String", function() {
			assert.isNull(PFLO.utils.getSubCookies(""));
		});

		it("Should return null when calling with null as first argument", function() {
			assert.isNull(PFLO.utils.getSubCookies(null));
		});

		it("Should return null when calling with undefined as first argument", function() {
			assert.isNull(PFLO.utils.getSubCookies(undefined));
		});

		it("Should return null when calling with a non-string object", function() {
			assert.isNull(PFLO.utils.getSubCookies({key: "value"}));
		});

		if (canSetCookies) {
			it("Should return the value that we've set previously", function() {
				var value = { subValue: "value" };
				PFLO.utils.setCookie(cookieName, value);
				assert.deepEqual(PFLO.utils.getSubCookies(PFLO.utils.getCookie(cookieName)), { subValue: "value" });
			});
		}

		it("Should return null when requesting the subCookie '&'", function() {
			assert.isNull(PFLO.utils.getSubCookies("&"));
		});

		it("Should return null when requesting a subCookie named '='", function() {
			assert.isNull(PFLO.utils.getSubCookies("="));
		});

		it("Should return null when requesting the subCookie '=&='", function() {
			assert.isNull(PFLO.utils.getSubCookies("=&="));
		});

		it("Should return null when requesting a value instead of a key for a subCookie i.e. '=someValue'", function() {
			assert.isNull(PFLO.utils.getSubCookies("=someValue"));
		});

		it("Should validate the old YUI PageFlo test", function() {
			var cookie = "one=1&two=2&three=3rd&four=null&five=undefined&six=0&seven=1.2&eight=" + encodeURIComponent("a=b") + "&nine=" + encodeURIComponent("1,2") + "&%3d=&10=11&11";

			var o = PFLO.utils.getSubCookies(cookie);
			assert.isNotNull(o);
			assert.isObject(o);

			assert.strictEqual(o.one, "1");
			assert.strictEqual(o.two, "2");
			assert.strictEqual(o.three, "3rd");
			assert.strictEqual(o.four, "null");
			assert.strictEqual(o.five, "undefined");
			assert.strictEqual(o.six, "0");
			assert.strictEqual(o.seven, "1.2");
			assert.strictEqual(o.eight, "a=b");
			assert.strictEqual(o.nine, "1,2");
			assert.strictEqual(o["="], "");
			assert.strictEqual(o["10"], "11");
			assert.strictEqual(o["11"], "");
		});

		it("Should validate that document.cookie contains quotes for a complex cookie", function() {
			var c = { a: 10, b: 20, c: "foo bar" };
			PFLO.utils.setCookie("complex-cookie", c);

			assert.match(document.cookie, /(^|; *)complex-cookie="a=10&b=20&c=foo%20bar"($| *;)/, "complex-cookie should be quoted");

			var d = PFLO.utils.getCookie("complex-cookie");

			assert.equal(d, "a=10&b=20&c=foo%20bar", "getCookie should remove quotes from complex cookie");

			var e = PFLO.utils.getSubCookies(d);

			assert.equal(e.a, c.a, "subcookies should match");
			assert.equal(e.b, c.b, "subcookies should match");
			assert.equal(e.c, c.c, "subcookies should match");
		});
	});

	describe("PFLO.utils.removeCookie()", function() {
		it("Should return false when given no argurments", function() {
			PFLO.session.domain = cookieDomain;

			assert.isFalse(PFLO.utils.removeCookie());
		});

		it("Should return false when the session domain isn't set", function() {
			PFLO.session.domain = undefined;

			assert.isFalse(PFLO.utils.removeCookie(cookieName));
		});

		if (canSetCookies) {
			it("Should return true when removing a Cookie", function() {
				PFLO.session.domain = cookieDomain;

				assert.isTrue(PFLO.utils.setCookie(cookieName, "value"));
				assert.isTrue(PFLO.utils.removeCookie(cookieName));
			});
		}
	});
});
