/*eslint-env mocha*/

describe("e2e/14-errors/42-unbound-removeEventListener", function() {
	it("Should infer PFLO.window as context for unbound removeEventListener calls", function(done) {
		if (typeof window.EventTarget === "undefined") {
			return this.skip();
		}

		assert.equal(PFLO.window, top);
		assert.equal(PFLO.window, window.parent);
		(function(){
			function callback(){
				assert.fail(0, 1, "Event should not fire");
			};
			this.addEventListener("foo", callback);

			// this is the unbound removeEventListener call
			removeEventListener("foo", callback);

			var event;
			try {
				event = new Event("foo");
			}
			catch (err) {
				event = window.document.createEvent("Event");
				event.initEvent("foo", true, true);
			}

			this.dispatchEvent(event);

			setTimeout(function(){
				done();
			}, 10);
		}).apply(PFLO.window);
	});

});
