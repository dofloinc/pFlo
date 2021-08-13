/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils.isArray()", function() {
	var assert = chai.assert;

	it("Should return false if input is not an array", function() {
		assert.isFalse(PFLO.utils.isArray(null));
		assert.isFalse(PFLO.utils.isArray(undefined));
		assert.isFalse(PFLO.utils.isArray("a"));
		assert.isFalse(PFLO.utils.isArray(1));
		assert.isFalse(PFLO.utils.isArray({}));
		assert.isFalse(PFLO.utils.isArray(function() {}));
	});

	it("Should return true if input is an array", function() {
		assert.isTrue(PFLO.utils.isArray([]));
		assert.isTrue(PFLO.utils.isArray([1, 2, 3, null, undefined]));
	});
});
