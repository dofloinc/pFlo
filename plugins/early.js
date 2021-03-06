/**
 * Plugin to send early beacons
 * Non-SPA:
 *    Send when config is loaded (onconfig event) if:
 *    - after DOMContentLoaded
 *    - before onload
 *    - not in prerender
 *    - autorun is true
 *    - not a reload or back/forward navigation
 *
 *    If we were in prerender, send when visible (prerender_to_visible event) if
 *    config was received and the conditions above are met.
 *    If onconfig fired before DOMContentLoaded, try again when DOMContentLoaded fires.
 *
 * SPA:
 *    Send when the count of resources we're waiting for drops to 0 for the first
 *    time + SPA_EARLY_TIMEOUT (controlled by AutoXHR plugin) and if:
 *    - not in prerender
 *    - not a reload or back/forward navigation
 *    Current limitations:
 *    - Does not check if before DOMContentLoaded.
 *    - Does not retry sending at prerender_to_visible event.
 *
 * @class PFLO.plugins.Early
 */

(function() {
	PFLO = window.PFLO || {};
	PFLO.plugins = PFLO.plugins || {};
	if (PFLO.plugins.Early) {
		return;
	}

	/* BEGIN_DEBUG */
	function debugLog(msg) {
		PFLO.debug(msg, "Early");
	}
	/* END_DEBUG */

	var impl = {
		initialized: false,
		autorun: true,
		earlyBeaconSent: false,  // early beacon has been sent
		singlePageApp: false,
		onConfigFired: false,

		/**
		 * Fired on spa_init event
		 */
		onSpaInit: function() {
			// a new SPA route is starting, reset to allow an early beacon for this new navigation
			this.earlyBeaconSent = false;
		},

		/**
		 * Fired on beacon event. Used to clear the vars we set on the beacon
		 */
		clearMetrics: function() {
			PFLO.removeVar("early");
		},

		/**
		 * Send an early beacon
		 *
		 * @param {object} config
		 * @param {string} edata Event data
		 * @param {string} ename Event name: spa, spa_hard, onconfig or prerender_to_visible
		 */
		sendEarlyBeacon: function(edata, ename) {
			var navigationType = 0,  // default to TYPE_NAVIGATE if it is not available
			    d, p = PFLO.getPerformance();

			d = PFLO.window && PFLO.window.document;
			// protect against undefined window/document
			if (!d) {
				return;
			}

			if (ename === "onconfig") {
				this.onConfigFired = true;
			}

			if (p && p.navigation) {
				navigationType = p.navigation.type;
			}

			if (this.earlyBeaconSent ||
			    // don't send if in prerender state
			    PFLO.visibilityState() === "prerender" ||
			    // don't send if this navigation is TYPE_RELOAD or TYPE_BACK_FORWARD
			    (navigationType === 1 || navigationType === 2) ||
			    // for non-SPA, don't send if:
			    (!this.singlePageApp &&
			        // autorun is false
			        (!this.autorun ||
			        // prerender_to_visible fired but we don't have config yet
			        (!this.onConfigFired && ename === "prerender_to_visible") ||
			        // DOMContentLoaded hasn't occurred yet
			        d.readyState === "loading" ||
			        // onload has already fired
			        PFLO.hasBrowserOnloadFired())) ||
			    // for SPA, only send on spa hard and soft events
			    (this.singlePageApp && !PFLO.utils.inArray(ename, PFLO.constants.BEACON_TYPE_SPAS))) {
				debugLog("Not sending early beacon");
				return;
			}

			this.earlyBeaconSent = true;

			// NOTE: Early beacons (and the early flag) don't support singleBeacon
			PFLO.addVar("early", "1");

			if (edata && PFLO.utils.inArray(edata.initiator, PFLO.constants.BEACON_TYPE_SPAS)) {
				PFLO.addVar("http.initiator", edata.initiator);
				PFLO.addVar("rt.start", "manual");
			}

			// let other plugins add data to the early beacon
			PFLO.fireEvent("before_early_beacon", edata);

			// send it!
			debugLog("Sending early beacon");
			PFLO.sendBeacon();
		}
	};

	PFLO.plugins.Early = {
		init: function(config) {
			if (config.primary || impl.initialized) {
				return this;
			}

			if (typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}

			// Check to see if any of the SPAs were enabled
			impl.singlePageApp = PFLO.plugins.SPA && PFLO.plugins.SPA.isSinglePageApp(config);

			PFLO.registerEvent("before_early_beacon");

			// Hook onconfig to trigger early beacon logic for non-SPA.
			PFLO.subscribe("config", impl.sendEarlyBeacon, "onconfig", impl, true);

			// Hook dom_loaded to trigger early beacon logic for non-SPA.
			PFLO.subscribe("dom_loaded", impl.sendEarlyBeacon, "dom_loaded", impl, true);

			// Hook spa_init to trigger early beacon logic for SPA.
			PFLO.subscribe("spa_init", impl.onSpaInit, null, impl);

			// If we were previously in prerender, the early beacon wouldn't have been sent.
			// Hook prerender_to_visible to trigger early beacon logic, if onload already happened this will be a noop
			PFLO.subscribe("prerender_to_visible", impl.sendEarlyBeacon, "prerender_to_visible", impl, true);

			PFLO.subscribe("beacon", impl.clearMetrics, null, impl);

			// don't send early flag on unload beacons
			PFLO.subscribe("before_beacon", function(vars) {
				if (typeof vars["rt.quit"] !== "undefined") {
					impl.clearMetrics();
				}
			}, null, impl);

			impl.initialized = true;
			return this;
		},

		is_complete: function() {
			return true;
		},

		// This plugin doesn't require any special browser functionality
		is_supported: function() {
			return impl.initialized;
		},

		sendEarlyBeacon: function(edata, ename) {
			impl.sendEarlyBeacon(edata, ename);
		}
	};
}());
