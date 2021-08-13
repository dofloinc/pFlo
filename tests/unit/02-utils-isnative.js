/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils.isNative()", function() {
	var assert = chai.assert;

	it("Should return false if input is not an function", function() {
		assert.isFalse(PFLO.utils.isNative(null));
		assert.isFalse(PFLO.utils.isNative(undefined));
		assert.isFalse(PFLO.utils.isNative());
		assert.isFalse(PFLO.utils.isNative(""));
		assert.isFalse(PFLO.utils.isNative(1));
		assert.isFalse(PFLO.utils.isNative(true));
		assert.isFalse(PFLO.utils.isNative(false));
		assert.isFalse(PFLO.utils.isNative(NaN));
	});

	it("Should return true if input is a native function", function() {
		assert.isTrue(PFLO.utils.isNative(Object));
		assert.isTrue(PFLO.utils.isNative(Number));
		assert.isTrue(PFLO.utils.isNative(parseInt));
	});

	it("Should return false if input is not a native function", function() {
		var nonNative = function(bar) {
			return false;
		};

		assert.isFalse(PFLO.utils.isNative(nonNative));
	});

	it("Should return false for a polyfill", function() {
		var _parseInt = window.parseInt;
		window.parseInt = function(bar) {
			return false;
		};

		assert.isFalse(PFLO.utils.isNative(window.parseInt));

		window.parseInt = _parseInt;
	});
});
