/*eslint-env mocha,node*/
/*global browser,by*/

var chai = require("chai");
var assert = chai.assert;

describe("PFLO Basic Integration test", function() {
	it("Should pass the Mocha unit tests", function(done) {
		browser.driver.get("http://localhost:4002/unit/index.html");

		browser.driver.wait(function() {
			return browser.driver.isElementPresent(by.css("#PFLO_test_complete"));
		});

		browser.driver.executeScript("return PFLO_test.isComplete()").then(function(complete){
			assert.equal(complete, true, "PFLO_test.isComplete()");
			browser.driver.executeScript("return PFLO_test.getTestFailureMessages()").then(function(testFailures){
				// log testFailures only if they exist
				if (testFailures.length > 0) {
					console.log("PFLO_test.getTestFailures():\n" + testFailures);
				}

				assert.equal(testFailures.length, 0);
				done();
			});
		});
	});
});
