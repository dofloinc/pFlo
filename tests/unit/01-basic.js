/*eslint-env mocha*/
/*global chai*/

describe("PFLO exports", function() {
	var assert = chai.assert;

	it("Should have an existing PFLO object", function() {
		assert.isObject(PFLO);
	});

	it("Should have an existing PFLO.utils object", function() {
		assert.isObject(PFLO.utils);
	});

	it("Should have an existing PFLO.version String", function() {
		assert.isString(PFLO.version);
	});

	it("Should have an existing PFLO.session Object", function() {
		assert.isObject(PFLO.session);
	});

	it("Should have an existing PFLO.init() Function", function() {
		assert.isFunction(PFLO.init);
	});

	it("Should have an existing PFLO.plugins Object", function(){
		assert.isObject(PFLO.plugins);
	});

	it("Should have an existing PFLO.url value", function(){
		assert.isString(PFLO.url);
	});
});
