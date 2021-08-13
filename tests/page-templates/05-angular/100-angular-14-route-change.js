/*eslint-env mocha*/
/*global PFLO_test,assert,angular*/

describe("e2e/05-angular/100-angular-14-route-change", function() {
	// use tests from #4
	PFLO_test.templates.SPA["04-route-change"]();

	it("Should be on version 1.4.x", function() {
		assert.equal(1, angular.version.major);
		assert.equal(4, angular.version.minor);
	});

});
