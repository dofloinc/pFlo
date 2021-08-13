/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/01-beacon-type/00-resourcetiming-disabled", function() {
	it("Should send an Image beacon because ResourceTiming is disabled", function(done) {
		PFLO_test.validateBeaconWasImg(done);
	});
});
