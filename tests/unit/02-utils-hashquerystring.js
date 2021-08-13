/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils.hashQueryString()", function() {
	var assert = chai.assert;

	it("Should return undefined when undefined is passed as argument", function() {
		assert.isUndefined(PFLO.utils.hashQueryString());
	});

	it("Should return null when null is passed as argument", function() {
		assert.isNull(PFLO.utils.hashQueryString(null));
	});

	it("Should return an empty string when an empty string is passed as argument", function() {
		assert.strictEqual(PFLO.utils.hashQueryString(""), "");
	});

	it("Should return an empty string when a non-URL is passed as an argument", function() {
		assert.strictEqual(PFLO.utils.hashQueryString("foo"), "");
	});

	it("Should return an empty string when an a non-string is passed as argument", function() {
		assert.strictEqual(PFLO.utils.hashQueryString(true), "");
		assert.strictEqual(PFLO.utils.hashQueryString({}), "");
		assert.strictEqual(PFLO.utils.hashQueryString([]), "");
		assert.strictEqual(PFLO.utils.hashQueryString(1), "");
	});

	it("Should return the URL untouched when passed with second argument false", function() {
		var url = "http://www.example.org/page#/app";
		assert.equal(PFLO.utils.hashQueryString(url, false), url);
	});

	it("Should return the URL untouched when passed with second argument false when there is a query string in it", function() {
		var url = "http://www.example.org/page?foo=1#app";
		assert.equal(PFLO.utils.hashQueryString(url, false), url);
	});

	it("Should return cleaned URL when passed with second argument true", function() {
		var url = "http://www.example.org/page#/app";
		var expected = "http://www.example.org/page";
		assert.equal(PFLO.utils.hashQueryString(url, true), expected);
	});

	it("Should return empty URL when URL starts with \"/\"", function() {
		var url = "/page",
		expected = "";
		assert.equal(PFLO.utils.hashQueryString(url), expected);
	});

	it("Should return empty URL when URL starts with \"/\" and second argument is true", function() {
		var url = "/page",
		expected = "";
		assert.equal(PFLO.utils.hashQueryString(url, true), expected);
	});

	it("Should append a protocol string to the URL when URL starts with \"//\" and second argument is true", function() {
		var url = "//page",
		expected = window.location.protocol + url;
		assert.equal(PFLO.utils.hashQueryString(url, true), expected);
	});

	it("Should hash the parameters in the URL but retain the hash when the second argument is false and 'FNV' was built into PFLO.utils", function() {
		var url = "http://www.example.org/app/page?key1=value&key2=value&key3=value&key4=value&key5=value#page",
		expected = "http://www.example.org/app/page?27hrhl9c#page";

		assert.equal(PFLO.utils.hashQueryString(url, false), expected);
	});

	it("Should hash the parameters in the URL and remove the hash when the second argument is true and 'FNV' was built into PFLO.utils", function() {
		var url = "http://www.example.org/app/page?key1=value&key2=value&key3=value&key4=value&key5=value#page",
		expected = "http://www.example.org/app/page?27hrhl9c";

		assert.equal(PFLO.utils.hashQueryString(url, true), expected);
	});

});
