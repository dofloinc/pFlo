/*eslint-env mocha*/
/*eslint-disable no-loop-func*/
/*global PFLO_test,assert*/

describe("e2e/11-restiming/06-iframes", function() {
	var t = PFLO_test;
	var tf = PFLO.plugins.TestFramework;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have a restiming parameter on the beacon (if ResourceTiming is supported)", function() {
		if (t.isResourceTimingSupported()) {
			var b = tf.lastBeacon();
			assert.isDefined(b.restiming);
		}
		else {
			this.skip();
		}
	});

	it("Should have all of the resouces on the page", function() {
		if (t.isResourceTimingSupported()) {
			var b = tf.lastBeacon();

			ResourceTimingDecompression.HOSTNAMES_REVERSED = false;
			var resources = ResourceTimingDecompression.decompressResources(JSON.parse(b.restiming));
			var pageResources = window.performance.getEntriesByType("resource");

			for (var i = 0; i < pageResources.length; i++) {
				var url = pageResources[i].name;

				// ideally, we should skip anything in RT that is newer than our beacon
				// skip beacon, pflo, & config URLs
				if (url.indexOf(PFLO.getBeaconURL()) !== -1 || url === PFLO.url || url === PFLO.config_url) {
					continue;
				}
				// skip favicon which is requested after beacon
				if (url.indexOf("/favicon.ico") !== -1) {
					continue;
				}

				assert.isDefined(PFLO.utils.arrayFind(resources, function(r) {
					return r.name === url;
				}), "Finding " + url);
			}
		}
		else {
			this.skip();
		}
	});

	it("Should have the IMG in the IFRAME", function() {
		if (t.isResourceTimingSupported()) {
			var b = tf.lastBeacon();

			ResourceTimingDecompression.HOSTNAMES_REVERSED = false;
			var resources = ResourceTimingDecompression.decompressResources(JSON.parse(b.restiming));

			assert.isDefined(PFLO.utils.arrayFind(resources, function(r) {
				return r.name.indexOf("/assets/img.jpg?iframe") !== -1;
			}), "Finding /assets/img.jpg?iframe in the IFRAME");
		}
		else {
			this.skip();
		}
	});
});
