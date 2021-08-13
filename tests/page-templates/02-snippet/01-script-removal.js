/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/02-snippet/01-script-removal", function() {
	var t = PFLO_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});
});
