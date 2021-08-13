/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils.getQueryParamValue()", function() {
	var assert = chai.assert;

	function getA(url) {
		var a = PFLO.window.document.createElement("a");
		a.href = url;
		return a;
	};

	it("Should return null when undefined is passed as param argument", function() {
		assert.isNull(PFLO.utils.getQueryParamValue(undefined));
	});

	it("Should return null when null is passed as param argument", function() {
		assert.isNull(PFLO.utils.getQueryParamValue(null));
	});

	it("Should return null when when an empty string is passed as param argument", function() {
		assert.isNull(PFLO.utils.getQueryParamValue(""));
	});

	it("Should return the correct parameter value (string url)", function() {
		var url = "http://www.example.com/";
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", url + "?foo=&bar="), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", url + "?foo&bar="), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", url + "?foo=1&bar="), "1");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", url + "?foo=%20a&bar="), " a");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", url + "?foo=bar=1&bar=2"), "bar=1");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", url + "?foo=1&bar"), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", url + "?foo=1&bar="), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", url + "?foo=1&bar=2"), "2");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", url + "?foo=1&bar=#3"), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", url + "?foo=1&bar=2+3"), "2 3");
	});

	it("Should return the correct parameter value (object url)", function() {
		var url = "http://www.example.com/";
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", getA(url + "?foo=&bar=")), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", getA(url + "?foo&bar=")), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", getA(url + "?foo=1&bar=")), "1");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", getA(url + "?foo=%20a&bar=")), " a");
		assert.strictEqual(PFLO.utils.getQueryParamValue("foo", getA(url + "?foo=bar=1&bar=2")), "bar=1");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", getA(url + "?foo=1&bar")), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", getA(url + "?foo=1&bar=")), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", getA(url + "?foo=1&bar=2")), "2");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", getA(url + "?foo=1&bar=#3")), "");
		assert.strictEqual(PFLO.utils.getQueryParamValue("bar", getA(url + "?foo=1&bar=2+3")), "2 3");
	});

	it("Should return null when there are no query parameters", function() {
		var url = "http://www.example.com/";
		assert.isNull(PFLO.utils.getQueryParamValue("bar", url + "#?foo=1&bar=2"));
		assert.isNull(PFLO.utils.getQueryParamValue("bar", getA(url + "#?foo=1&bar=2")));
	});

	it("Should return null when the param is not in the query parameters", function() {
		var url = "http://www.example.com/";
		assert.isNull(PFLO.utils.getQueryParamValue("abc", url + "?foo=1&bar=2"));
		assert.isNull(PFLO.utils.getQueryParamValue("abc", getA(url + "?foo=1&bar=2")));
	});

	it("Should return null when the param is malformed query parameters", function() {
		var url = "http://www.example.com/";
		assert.isNull(PFLO.utils.getQueryParamValue("bar", url + "?foo=1&bar=_v%B0%FC"));
	});
});
