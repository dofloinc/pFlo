/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/01-beacon-type/06-beacon-type-get-no-xhr", function() {
	it("Should not send an beacon via XHR when beacon type is GET", function() {
		if (PFLO && typeof PFLO.sendXhrPostBeacon === "function") {
			assert.isDefined(window.pfloxhr);
			assert.strictEqual(window.pfloxhr, "TestString", "Expected beacon to be not sent via XHR");
			assert.isDefined(window.xhrparams);
			assert.strictEqual(window.xhrparams, "TestString", "Expected beacon to be not sent via XHR");
		}
	});
});
