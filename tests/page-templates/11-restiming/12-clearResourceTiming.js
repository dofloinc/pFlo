/*eslint-env mocha*/
/*global PFLO_test*/

describe("e2e/11-restiming/12-clearResourceTiming", function() {
	var t = PFLO_test;
	var tf = PFLO.plugins.TestFramework;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should find both scripts", function() {
		if (!t.isResourceTimingSupported()) {
			return this.skip();
		}

		var b = tf.lastBeacon();
		var entries = ResourceTimingDecompression.decompressResources(JSON.parse(b.restiming));

		PFLO.utils.forEach(["one.js", "two.js"], function(file) {
			assert.isDefined(PFLO.utils.arrayFind(entries, function(e){
				return e.name.indexOf(file) > -1;
			}), "can't find: " + file);
		});
	});
});
