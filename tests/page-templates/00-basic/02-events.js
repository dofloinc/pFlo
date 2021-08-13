/*eslint-env mocha*/
/*global PFLO_test,assert*/

describe("e2e/00-basic/02-events", function() {
	var tf = PFLO.plugins.TestFramework;

	it("Should have fired myevent with the correct data", function() {
		assert.equal("a", window.myevent);
	});
});
