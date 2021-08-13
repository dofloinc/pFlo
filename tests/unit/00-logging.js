/*eslint-env mocha*/
/*global chai*/

describe("PFLO logging", function() {
	var assert = chai.assert;

	it("Should have an existing PFLO.info() function (Will be set to a stub for less noise during tests)", function() {
		assert.isFunction(PFLO.info);
		PFLO.info = function() {};
	});

	it("Should have an existing PFLO.debug() function (Will be set to a stub for less noise during tests)", function() {
		assert.isFunction(PFLO.debug);
		PFLO.debug = function() {};
	});

	it("Should have an existing PFLO.warn() function (Will be set to a stub for less noise during tests)", function() {
		assert.isFunction(PFLO.warn);
		PFLO.warn = function() {};
	});

	it("Should have an existing PFLO.error() function (Will be set to a stub for less noise during tests)", function() {
		assert.isFunction(PFLO.error);
		PFLO.error = function() {};
	});
});
