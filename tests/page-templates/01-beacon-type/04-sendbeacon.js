/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/01-beacon-type/04-send-beacon", function() {
	it("Should send an beacon via navigator.sendBeacon if it is available", function() {
		if (window && window.navigator && typeof window.navigator.sendBeacon === "function") {
			assert.isDefined(window.sendBeaconUrl);
			assert.equal(window.sendBeaconUrl, PFLO_test.BEACON_URL);

			assert.isDefined(window.sendBeaconData);
		}
		else {
			this.skip();
		}
	});
});
