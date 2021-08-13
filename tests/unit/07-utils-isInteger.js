/*eslint-env mocha*/
/*global chai*/

/* Test cases from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Examples
Number.isInteger(0);         // true
Number.isInteger(1);         // true
Number.isInteger(-100000);   // true
Number.isInteger(99999999999999999999999); // true

Number.isInteger(0.1);       // false
Number.isInteger(Math.PI);   // false

Number.isInteger(NaN);       // false
Number.isInteger(Infinity);  // false
Number.isInteger(-Infinity); // false
Number.isInteger('10');      // false
Number.isInteger(true);      // false
Number.isInteger(false);     // false
Number.isInteger([1]);       // false
*/

describe("PFLO.utils.isInteger()", function() {
	var assert = chai.assert;

	// Blow away the original isInteger method to exercise the polyfill
	// in PFLO.utils.isInteger().
	var origIsInteger = Number.isInteger;
	Number.isInteger = undefined;

	it("Should not have access to the native Number.isInteger function", function() {
		assert.isUndefined(Number.isInteger);
	});

	it("Should return false when input is not an integer", function(){
		assert.isUndefined(Number.isInteger);
		assert.isFalse(PFLO.utils.isInteger("-123"));
		assert.isFalse(PFLO.utils.isInteger("123"));
		assert.isFalse(PFLO.utils.isInteger("stringvalue"));
		assert.isFalse(PFLO.utils.isInteger(0.1));
		assert.isFalse(PFLO.utils.isInteger(Math.PI));
		assert.isFalse(PFLO.utils.isInteger(NaN));
		assert.isFalse(PFLO.utils.isInteger(Infinity));
		assert.isFalse(PFLO.utils.isInteger(-Infinity));
		assert.isFalse(PFLO.utils.isInteger(true));
		assert.isFalse(PFLO.utils.isInteger(false));
		assert.isFalse(PFLO.utils.isInteger([1]));
	});

	it("Should return true when input is an integer", function() {
		assert.isUndefined(Number.isInteger);
		assert.isTrue(PFLO.utils.isInteger(1));
		assert.isTrue(PFLO.utils.isInteger(0));
		assert.isTrue(PFLO.utils.isInteger(-100000));
		assert.isTrue(PFLO.utils.isInteger(99999999999999999999999));
	});

	it("Should have restored accesss to the native Number.isInteger function", function() {
		Number.isInteger = origIsInteger;
		assert.isDefined(Number.isInteger);
	});
});
