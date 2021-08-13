/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/02-snippet/00-snippet", function() {
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});
});
