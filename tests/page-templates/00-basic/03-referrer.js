/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/00-basic/03-referrer", function() {
	var tf = PFLO.plugins.TestFramework;

	it("The referrer should have been set to this window's location", function() {
		// ensure there was a referrer on the IFRAME beacon
		chai.assert.equal(window.lastReferrer, window.location.href);
	});
});
