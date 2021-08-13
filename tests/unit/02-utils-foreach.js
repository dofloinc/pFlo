/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils.forEach()", function() {
	var assert = chai.assert;

	it("Should handle degenerate cases", function() {
		assert.doesNotThrow(function() {
			PFLO.utils.forEach();
			PFLO.utils.forEach(null);
			PFLO.utils.forEach(true);
			PFLO.utils.forEach(false);
			PFLO.utils.forEach(0);
			PFLO.utils.forEach(1);
			PFLO.utils.forEach(123);
			PFLO.utils.forEach("");
			PFLO.utils.forEach({});
		});
	});

	it("Should not call the callback when the array is empty", function(done) {
		PFLO.utils.forEach([], function() {
			done(new Error("how dare you"));
		});
		done();
	});

	it("Should have no return value", function() {
		var returnValue = PFLO.utils.forEach([1, 2, 3], function() {});
		assert.isUndefined(returnValue);
	});

	it("Should iterate over an array", function() {
		var expected = [1, 2, 3];
		var actual = [];
		PFLO.utils.forEach(expected, function(i) {
			actual.push(i);
		});
		assert.sameMembers(expected, actual);
	});

	it("Should use the correct context on the callback", function(done) {
		function Obj(value) {
			this.value = value;
		}
		Obj.prototype.check = function() {
			assert.strictEqual(this.value, 123);
			done();
		};
		PFLO.utils.forEach([0], Obj.prototype.check, new Obj(123));
	});

});
