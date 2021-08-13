/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/01-beacon-type/02-resourcetiming-enabled-browser-unsupported", function() {
	it("Should send an Image beacon if ResourceTiming is enabled, but the browser doesn't support it", function(done) {
		if (!PFLO_test.isResourceTimingSupported()) {
			PFLO_test.validateBeaconWasImg(done);
		}
		else {
			// NOTE: If not, another test handles
			done();
		}
	});
});
