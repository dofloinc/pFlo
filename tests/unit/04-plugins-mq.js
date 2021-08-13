/*eslint-env mocha*/
/*global chai*/

describe("PFLO.plugins.mq", function() {
	var assert = chai.assert;

	describe("exports", function() {
		it("Should have a PFLO_mq object", function() {
			assert.isObject(PFLO.window.PFLO_mq);
		});

		it("Should have a push() function", function() {
			assert.isFunction(PFLO.window.PFLO_mq.push);
		});
	});

	describe("push()", function() {
		it("Should handle degenerate cases", function() {
			assert.doesNotThrow(function() {
				PFLO.window.PFLO_mq.push(
					null,
					undefined,
					false,
					true,
					"null",
					"undefined",
					"false",
					"true",
					"",
					0,
					1,
					27,
					[],
					{},
					["foo"],
					["foo.bar"],
					["foo.bar.baz"]
				);
			});
		});

		describe("array pattern", function() {
			it("Should call methods on PFLO", function(done) {
				PFLO.method = function() {
					done();
				};
				PFLO.window.PFLO_mq.push(["method"]);
			});

			it("Should call namespaced methods on PFLO", function(done) {
				PFLO.method = function() {
					done();
				};
				PFLO.window.PFLO_mq.push(["PFLO.method"]);
			});

			it("Should pass all arguments", function(done) {
				PFLO.method = function() {
					assert.lengthOf(arguments, 3);
					assert.equal(arguments[0], 0);
					assert.equal(arguments[1], 1);
					assert.equal(arguments[2], 2);
					done();
				};
				PFLO.window.PFLO_mq.push(["method", 0, 1, 2]);
			});

			it("Should support `push` with multiple arguments", function(done) {
				var results = [];
				PFLO.method1 = function() {
					results.push("method1");
				};
				PFLO.method2 = function() {
					results.push("method2");
				};
				PFLO.method3 = function() {
					assert.lengthOf(results, 2);
					assert.equal(results[0], "method1");
					assert.equal(results[1], "method2");
					done();
				};
				PFLO.window.PFLO_mq.push(
						["method1"],
						["method2"],
						["method3"]
				);
			});

			it("Should step into objects on PFLO", function(done) {
				PFLO.obj = {
					method: function() {
						done();
					}
				};
				PFLO.window.PFLO_mq.push(["obj.method"]);
			});

			it("Should step into functions on PFLO", function(done) {
				PFLO.func = function() {};
				PFLO.func.method = function() {
					done();
				};
				PFLO.window.PFLO_mq.push(["func.method"]);
			});

			it("Should use appropriate context", function(done) {
				PFLO.obj = {
					method1: function() {
						this.method2();
					},
					method2: function() {
						done();
					}
				};
				PFLO.window.PFLO_mq.push(["obj.method1"]);
			});
		});

		describe("object pattern", function() {
			it("Should support `arguments`", function(done) {
				PFLO.method = function() {
					done();
				};
				PFLO.window.PFLO_mq.push({
					arguments: ["method"]
				});
			});
			it("Should support `callback`", function(done) {
				PFLO.method = function() {
					return 123;
				};
				PFLO.window.PFLO_mq.push({
					arguments: ["method"],
					callback: function() {
						assert.lengthOf(arguments, 1);
						assert.equal(arguments[0], 123);
						done();
					}
				});
			});
			it("Should support `thisArg`", function(done) {
				function Item(value) {
					this.value = value;
				}
				Item.prototype.callback = function() {
					assert.equal(this.value, 123);
					done();
				};

				PFLO.method = function() {};
				PFLO.window.PFLO_mq.push({
					arguments: ["method"],
					callback: Item.prototype.callback,
					thisArg: new Item(123)
				});
			});
		});
	});

});
