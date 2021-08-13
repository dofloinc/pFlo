/*eslint-env mocha*/
/*global chai*/

describe("PFLO.utils localStorage", function() {
	var assert = chai.assert;

	var storageName = "myStorage";

	/*
		NOTE:

		These tests can only run in a client-server setup with a properly
		configured FQDN for the server.

		Please read:
			RFC 2109 (https://www.ietf.org/rfc/rfc2109.txt)
		and this thread on the chromium bugtracker:
			https://code.google.com/p/chromium/issues/detail?id=535

		In your development environment please configure your localhost with a fully
		qualified domain name locally:

		In a UNIX/Mac/Linux environment you can add a name for 127.0.0.1 to
		your /etc/hosts such as:
			127.0.0.1	www.example.org  www

		You can do the same under windows, however the path to the file is a
		little different:

		Valid for Windown Vista/7/2008/2012: C:\Windows\System32\drivers\etc\hosts

		We (as in the pflo team) are not responsible for any accidental or
		direct damages and or damage claims. See LICENSE for further information.
	*/

	if (window.location.protocol === "file:") {
		return;
	}

	// need to skip some test in browsers without support
	var canSetStorage = (function() {
		var name = "_pflo_csls", result = false;
		try {
			window.localStorage.setItem(name, name);
			result = (window.localStorage.getItem(name) === name);
			window.localStorage.removeItem(name);
		}
		catch (ignore) {
			// Empty
		}
		return result;
	})();

	describe("PFLO.utils.getLocalStorage()", function() {
		it("Should have an exisiting PFLO.utils.getLocalStorage function", function() {
			assert.isFunction(PFLO.utils.getLocalStorage);
		});

		it("Should return null when calling getLocalStorage() with empty arguments", function() {
			assert.isNull(PFLO.utils.getLocalStorage());
		});

		it("Should return null when calling getLocalStorage with empty String", function() {
			assert.isNull(PFLO.utils.getLocalStorage(""));
		});

		it("Should return null when calling with null as first argument", function() {
			assert.isNull(PFLO.utils.getLocalStorage(null));
		});

		if (canSetStorage) {
			it("Should return undefined when calling with non existing storage name", function() {
				assert.isUndefined(PFLO.utils.getLocalStorage("some-non-existing-storage"));
			});
		}
		else {
			it("Should return null when localStorage is not supported ", function() {
				assert.isNull(PFLO.utils.getLocalStorage("any-storage"));
			});
		}
	});

	describe("PFLO.utils.setLocalStorage()", function() {
		it("Should have an exisiting PFLO.utils.setLocalStorage function", function() {
			assert.isFunction(PFLO.utils.setLocalStorage);
		});

		it("Should return false if no name was passed as first argument to setLocalStorage()", function() {
			assert.isFalse(PFLO.utils.setLocalStorage());
		});

		if (canSetStorage) {
			it("Should return false when setting only storage name", function() {
				assert.isFalse(PFLO.utils.setLocalStorage(storageName));
			});

			it("Should return true when setting storage with value", function() {
				assert.isTrue(PFLO.utils.setLocalStorage(storageName, {key: "value"}));
				PFLO.utils.removeLocalStorage(storageName);
			});

			it("Should return the value that we've set previously", function() {
				var value = { key: "value", key2: true, key3: 123, key4: {subkey: "value"} };
				PFLO.utils.setLocalStorage(storageName, value);
				assert.deepEqual(PFLO.utils.getLocalStorage(storageName), value);
				PFLO.utils.removeLocalStorage(storageName);
			});

			it("Should return the EXACT value string that we've set previously", function() {
				var value = "1";
				var value_strict_false = 1;

				PFLO.utils.setLocalStorage(storageName, { key: value });
				assert.strictEqual(PFLO.utils.getLocalStorage(storageName).key, value);
				assert.notStrictEqual(PFLO.utils.getLocalStorage(storageName).key, value_strict_false);
				PFLO.utils.removeLocalStorage(storageName);
			});

			it("Should return the value that we've set previously with a large expiry", function() {
				var value = { key: "value", key2: true, key3: 123, key4: {subkey: "value"} };
				PFLO.utils.setLocalStorage(storageName, value, 5 * 60);
				assert.deepEqual(PFLO.utils.getLocalStorage(storageName), value);
				PFLO.utils.removeLocalStorage(storageName);
			});

			it("Should return undefined for a storage that we've set previously with a zero expiry", function() {
				var value = { key: "value", key2: true, key3: 123, key4: {subkey: "value"} };
				PFLO.utils.setLocalStorage(storageName, value, 0);
				assert.isUndefined(PFLO.utils.getLocalStorage(storageName));
			});

			it("Should return undefined for a storage that we've set previously with a negative expiry", function() {
				var value = { key: "value", key2: true, key3: 123, key4: {subkey: "value"} };
				PFLO.utils.setLocalStorage(storageName, value, -1);
				assert.isUndefined(PFLO.utils.getLocalStorage(storageName));
			});

			it("Should return false when trying to set a storage item bigger than 50000 characters", function() {
				var value = "";
				for (var index = 0; index <= 50000; index++) {
					value += "1";
				}

				assert.isFalse(PFLO.utils.setLocalStorage("failStorage", {key: value}));
			});
		}
		else {
			it("Should return false when localStorage is not supported", function() {
				assert.isFalse(PFLO.utils.setLocalStorage(storageName, {key: "value"}));
			});
		}
	});

	describe("PFLO.utils.removeLocalStorage()", function() {
		it("Should return false when given no argurments", function() {
			assert.isFalse(PFLO.utils.removeLocalStorage());
		});

		if (canSetStorage) {
			it("Should return true when removing storage with value", function() {
				assert.isTrue(PFLO.utils.removeLocalStorage(storageName));
			});

			it("Should remove a storage item we've set previously", function() {
				assert.isTrue(PFLO.utils.setLocalStorage(storageName, { key: "value" }));
				assert.isTrue(PFLO.utils.removeLocalStorage(storageName));
				assert.isUndefined(PFLO.utils.getLocalStorage(storageName));
			});
		}
		else {
			it("Should return false when localStorage is not supported", function() {
				assert.isFalse(PFLO.utils.removeLocalStorage(storageName));
			});
		}
	});
});
