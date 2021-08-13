/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils exports", function() {
	var assert = chai.assert;

	it("Should have an existing PFLO.utils object", function() {
		assert.isObject(PFLO.utils);
	});

	it("Should have an existing Function PFLO.utils.cleanUpURL()", function() {
		assert.isFunction(PFLO.utils.cleanupURL);
	});

	it("Should have an existing Function PFLO.utils.hashQueryString()", function() {
		assert.isFunction(PFLO.utils.hashQueryString);
	});

	it("Should have an existing Function PFLO.utils.pluginConfig()", function() {
		assert.isFunction(PFLO.utils.pluginConfig);
	});

	it("Should have an existing Function PFLO.utils.hashString()", function() {
		assert.isFunction(PFLO.utils.hashString);
	});

	describe("isObjectEmpty()", function() {
		it("Should return false for non-empty objects", function() {
			assert.isFalse(PFLO.utils.isObjectEmpty({ a: 1 }));

			assert.isFalse(PFLO.utils.isObjectEmpty({ a: 1, b: 2 }));
		});

		it("Should return true for empty objects", function() {
			assert.isTrue(PFLO.utils.isObjectEmpty({}));

			assert.isTrue(PFLO.utils.isObjectEmpty());
		});
	});
});
