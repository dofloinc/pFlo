/*eslint-env mocha*/
/*global PFLO_test,assert*/
describe("e2e/29-opt-out-opt-in/01-opt-in-origin-injected-loader-wrapper", function() {
	var snippetStart = window.PFLO.snippetStart;

	// We need to do this because PFLO TF is not initialized yet
	var assert = window.chai.assert;

	it("[Before Opt-in] Should have loaded PFLO", function() {
		assert.isUndefined(snippetStart);
	});

	BOOMERANG_LOADER_WRAPPER();

	it("[After Opt-in] Should not have loaded PFLO", function() {
		assert.isDefined(window.PFLO.snippetStart);
	});

});
