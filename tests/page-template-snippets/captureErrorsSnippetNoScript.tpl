(function(w){
	w.PFLO = w.PFLO || {};

	w.PFLO.globalOnErrorOrig = w.PFLO.globalOnError = w.onerror;
	w.PFLO.globalErrors = [];

	// Gathers a high-resolution timestamp (when available), or falls back to Date.getTime()
	var now = (function() {
		try {
			if ("performance" in w && w.performance.timing) {
				return function() {
					return Math.round(w.performance.now() + performance.timing.navigationStart);
				};
			}
		}
		catch (ignore) {
			// NOP
		}

		return Date.now || function() {
			return new Date().getTime();
		};
	})();

	// Overwrite the global onerror to listen for errors, but forward all messages to the original one if it exists
	w.onerror = function PFLO_plugins_errors_onerror(message, fileName, lineNumber, columnNumber, error) {
		if (w.PFLO.version) {
			// If PageFlo has already loaded, the only reason this function would still be alive would be if
			// we're in the chain from another handler that overwrote window.onerror.  In that case, we should
			// run globalOnErrorOrig which presumably hasn't been overwritten by PageFlo.
			if (typeof w.PFLO.globalOnErrorOrig === "function") {
				w.PFLO.globalOnErrorOrig.apply(w, arguments);
			}

			return;
		}

		// Save this error for when PageFlo loads
		if (typeof error !== "undefined" && error !== null) {
			error.timestamp = now();
			w.PFLO.globalErrors.push(error);
		}
		else {
			w.PFLO.globalErrors.push({
				message: message,
				fileName: fileName,
				lineNumber: lineNumber,
				columnNumber: columnNumber,
				noStack: true,
				timestamp: now()
			});
		}

		// Call the original window.onerror
		if (typeof w.PFLO.globalOnError === "function") {
			w.PFLO.globalOnError.apply(w, arguments);
		}
	};

	// make it easier to detect this is our wrapped handler
	w.onerror._bmr = true;
})(window);
