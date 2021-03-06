/**
 * The History plugin allows you to automatically monitor Single Page
 * App (SPA) navigations that change their routes via the
 * [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history)
 * object.
 *
 * The History plugin can be used for any SPA (eg. Angular, Backbone, Ember, React, Vue, etc.)
 * and replaces the deprecated Angular, Backbone and Ember plugins.
 *
 * **Note**: This plugin requires the {@link PFLO.plugins.AutoXHR} and
 * {@link PFLO.plugins.SPA} plugins to be loaded first (in that order).
 *
 * For details on how PageFlo Single Page App instrumentation works, see the
 * {@link PFLO.plugins.SPA} documentation.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Compatibility
 *
 * This plugin should work with any Single Page App, by instrumenting the
 * [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history)
 * object to monitor for route changes.
 *
 * The SPA app needs to change the history state or hash before doing the work required to
 * change the route (eg. XHRs, DOM node changes). With frameworks where the history events
 * happen after the route change has completed (e.g. Ember.js 1.x), we can configure the
 * plugin with `monitorHistory: false` and call `PFLO.plugins.SPA.route_change()` manually
 * when the route change begins.
 *
 * ## Beacon Parameters
 *
 * This plugin does not add any additional beacon parameters beyond the
 * {@link PFLO.plugins.SPA} plugin.
 *
 * ## Usage
 *
 * Include the {@link PFLO.plugins.AutoXHR}, {@link PFLO.plugins.SPA}
 * and {@link PFLO.plugins.History} plugins.  See {@tutorial building} for details.
 *
 * @class PFLO.plugins.History
 */
(function() {
	var impl = {
		monitorHistory: true,  // if monitorHistory is false then the History object will not be hooked
		enabled: true,
		hooked: false,
		routeChangeInProgress: false,  // will store the setTimeout id when set
		disableHardNav: false,  // whether or not to disable SPA hard beacons
		routeFilter: undefined,  // route change filter callback function
		routeChangeWaitFilter: undefined,  // route change wait filter callback function
		monitorReplaceState: true,  // whether or not to hook history.replaceState
		a: undefined,  // helper anchor object used to cleanup urls
		browserOnloadBeforeSetup: false,  // browser onload happened before our setup

		DEPRECATED_PLUGINS: ["Angular", "Backbone", "Ember"],

		/**
		 * Clears routeChangeInProgress flag
		 */
		resetRouteChangeInProgress: function(edata) {
			// Three types of beacons can go out before the Page Load beacon: Early Beacon, Custom Metric and Custom Timer.
			// For those beacon types, we want to keep the state unchanged.
			if (edata &&
				(
					(typeof edata.early !== "undefined") ||
					(edata["http.initiator"] && edata["http.initiator"].indexOf("api_custom_") === 0)
				)) {

				return;
			}

			debugLog("resetting routeChangeInProgress");

			if (impl.routeChangeInProgress) {
				clearTimeout(impl.routeChangeInProgress);
			}

			impl.routeChangeInProgress = false;
		},

		/**
		 * Sets routeChangeInProgress flag and sets up timer to clear it later
		 */
		setRouteChangeInProgress: function() {
			if (impl.routeChangeInProgress) {
				clearTimeout(impl.routeChangeInProgress);
			}
			// reset our routeChangeInProgress flag as soon as the browser is free.
			// Current browser behavior favors sending internal events over calling
			// timeout callbacks. If for example the back button is clicked and a replaceState
			// is called then the popstate event should be triggered to extend this timeout before
			// the callback is called.
			impl.routeChangeInProgress = setTimeout(impl.resetRouteChangeInProgress, 50);
		},

		/**
		 * Called on route change
		 */
		routeChange: function(event) {
			if (!impl.enabled) {
				debugLog("Not enabled - we've missed a routeChange");
				impl.resetRouteChangeInProgress();
			}
			else {
				// don't track the SPA route change until the onload (page_ready)
				// has fired
				if (impl.disableHardNav && !PFLO.onloadFired()) {
					debugLog("disableHardNav and not page_ready, not triggering");
					return;
				}

				if (!impl.routeChangeInProgress) {
					debugLog("routeChange triggered, sending route_change() event");
					if (event.toUrl) {
						impl.a.href = event.toUrl;
						event.toUrl = impl.a.href;
					}
					PFLO.plugins.SPA.route_change(null, [event.type, event.fromUrl, event.toUrl]);
				}
				else {
					debugLog("routeChangeInProgress, not triggering");
				}
			}
		}
	};

	PFLO = window.PFLO || {};
	PFLO.plugins = PFLO.plugins || {};

	// Checking for Plugins required and if already integrated
	if (PFLO.plugins.History ||
	    typeof PFLO.plugins.SPA === "undefined" ||
	    typeof PFLO.plugins.AutoXHR === "undefined") {
		return;
	}

	// check that window and document available
	if (!PFLO.window || !PFLO.window.document) {
		return;
	}

	// register as a SPA plugin
	PFLO.plugins.SPA.register("History");

	impl.a = PFLO.window.document.createElement("A");

	/* BEGIN_DEBUG */
	/**
	 * Debug logging for this instance
	 *
	 * @param {string} msg Message
	 */
	function debugLog(msg) {
		PFLO.debug(msg, "History");
	};
	/* END_DEBUG */

	/**
	 * Hook into `window.history` Object
	 *
	 * This function will override the following functions if available:
	 *   - pushState
	 *   - replaceState
	 *   - go
	 *   - back
	 *   - forward
	 * And listen to event:
	 *   - hashchange
	 *   - popstate
	 */
	function setup() {
		var history = PFLO.window.history;

		//
		// History API overrides
		//

		if (typeof history.pushState === "function") {
			history.pushState = (function(_pushState) {
				return function(state, title, url) {
					debugLog("pushState, title: " + title + " url: " + url);
					impl.routeChange({type: "pushState", fromUrl: PFLO.window.document.URL, toUrl: url});
					return _pushState.apply(this, arguments);
				};
			})(history.pushState);
		}

		if (impl.monitorReplaceState && typeof history.replaceState === "function") {
			history.replaceState = (function(_replaceState) {
				return function(state, title, url) {
					var fromUrl = PFLO.window.document.URL, toUrl = fromUrl;

					// url is an optional param
					if (arguments.length >= 3 && typeof url !== "undefined" && url !== null) {
						impl.a.href = url;  // normalize url
						toUrl = impl.a.href;
					}

					// only issue route change if a nav is not in progress or the URL is changing
					if (!PFLO.plugins.SPA.isSpaNavInProgress() || toUrl !== fromUrl) {
						debugLog("replaceState, title: " + title + " url: " + url);
						impl.routeChange({type: "pushState", fromUrl: PFLO.window.document.URL, toUrl: url});
					}
					else {
						debugLog("replaceState ignored (no URL change and a SPA nav is in progress), title: " + title + " url: " + url);
					}
					return _replaceState.apply(this, arguments);
				};
			})(history.replaceState);
		}

		// we instrument go, back and forward because they are called earlier than the
		// popstate event which gives AutoXHR a chance to setup the MO
		if (typeof history.go === "function") {
			history.go = (function(_go) {
				return function(index) {
					debugLog("go");
					impl.routeChange({type: "go", fromUrl: PFLO.window.document.URL});  // spa_init url will be the url before `go` runs .. for routefilter also
					return _go.apply(this, arguments);
				};
			})(history.go);
		}

		if (typeof history.back === "function") {
			history.back = (function(_back) {
				return function() {
					debugLog("back");
					impl.routeChange({type: "back", fromUrl: PFLO.window.document.URL});  // spa_init url will be the url before `back` runs
					return _back.apply(this, arguments);
				};
			})(history.back);
		}

		if (typeof history.forward === "function") {
			history.forward = (function(_forward) {
				return function() {
					debugLog("forward");
					impl.routeChange({type: "forward", fromUrl: PFLO.window.document.URL});  // spa_init url will be the url before `forward` runs
					return _forward.apply(this, arguments);
				};
			})(history.forward);
		}

		// listen for hash changes.
		// hashchange events may be available even if the browser does not support the History API
		PFLO.window.addEventListener("hashchange", function(event) {
			var url = (event || {}).newURL;
			debugLog("hashchange " + url);
			impl.routeChange({type: "hashchange", toUrl: url});
		});

		/**
		 * Add event listener for `popstate`
		 */
		function aelPopstate() {
			// popstate events may be available even if the browser does not support the History API
			PFLO.window.addEventListener("popstate", function(event) {
				debugLog("popstate");
				impl.routeChange({type: "popstate", toUrl: PFLO.window.document.URL});
			});
		}

		// add listener for popstate after page load has occured so that we don't receive an unwanted popstate
		// event at onload
		if (PFLO.hasBrowserOnloadFired()) {
			aelPopstate();
		}
		else {
			// the event listener will be registered early enough to get an unwanted event if we don't use setTimeout
			PFLO.window.addEventListener("load", function() { setTimeout(aelPopstate, 0); });
		}

		// listen for a beacon
		PFLO.subscribe("beacon", impl.resetRouteChangeInProgress);

		// listen for spa cancellations
		PFLO.subscribe("spa_cancel", impl.resetRouteChangeInProgress);

		// listen for spa inits. We're adding this to catch the event sent by the SPA plugin
		PFLO.subscribe("spa_init", impl.setRouteChangeInProgress);

		// if browser onload event has happened, assume we missed the route change
		impl.browserOnloadBeforeSetup = PFLO.hasBrowserOnloadFired();

		return true;
	};

	//
	// Exports
	//
	PFLO.plugins.History = {
		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof PFLO.plugins.History
		 */
		is_complete: function() {
			return true;
		},

		/**
		 * Hooks PageFlo into the History events.
		 *
		 * @param {object} history Deprecated
		 * @param {boolean} [hadRouteChange] Deprecated
		 * event prior to this `hook()` call
		 * @param {object} [options] Optional options. Can contain `routeFilter` and/or `routeChangeWaitFilter`
		 *
		 * @returns {@link PFLO.plugins.History} The History plugin for chaining
		 * @memberof PFLO.plugins.History
		 */
		hook: function(history, hadRouteChange, options) {
			try {
				debugLog("hook: " + JSON.stringify(options));
			}
			catch (e) {
				debugLog("hook: can't stringify options");
			}

			options = options || {};
			options.disableHardNav = impl.disableHardNav;

			if (impl.routeFilter) {
				options.routeFilter = impl.routeFilter;
			}

			if (impl.routeChangeWaitFilter) {
				options.routeChangeWaitFilter = impl.routeChangeWaitFilter;
			}

			if (!impl.hooked && impl.monitorHistory) {
				setup();
			}

			// allow to call again in case options changed
			hadRouteChange = impl.browserOnloadBeforeSetup;
			PFLO.plugins.SPA.hook(hadRouteChange, options);

			if (!impl.hooked && !impl.browserOnloadBeforeSetup && (!impl.disableHardNav || PFLO.onloadFired())) {
				// fire our route change asap so that we can listen for mutatations, etc
				PFLO.plugins.SPA.route_change();
				impl.setRouteChangeInProgress();
			}

			impl.hooked = true;
			return this;
		},

		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {boolean} [config.History.auto] Whether or not to automatically
		 * instrument the `window.history` object.
		 * If set to `false`, the React snippet should be used.
		 * @param {boolean} [config.History.disableHardNav] Whether or not to disable SPA hard beacons
		 * @param {function} [config.History.routeFilter] Route change filter callback function
		 * @param {function} [config.History.routeChangeWaitFilter] Route change wait filter callback function
		 * @param {boolean} [config.History.monitorReplaceState] Whether or not to hook History.replaceState
		 *
		 * @returns {@link PFLO.plugins.History} The History plugin for chaining
		 * @example
		 * PFLO.init({
		 *   History: {
		 *     enabled: true
		 *   });
		 * });
		 * @memberof PFLO.plugins.History
		 */
		init: function(config) {
			PFLO.utils.pluginConfig(impl, config, "History",
				["enabled", "monitorHistory", "disableHardNav",
				 "routeFilter", "routeChangeWaitFilter",
				 "monitorReplaceState"]);

			if (impl.enabled) {
				this.hook();
			}

			return this;
		},

		/**
		 * Disables the History plugin
		 *
		 * @returns {@link PFLO.plugins.History} The History plugin for chaining
		 * @memberof PFLO.plugins.History
		 */
		disable: function() {
			impl.enabled = false;
			return this;
		},

		/**
		 * Enables the History plugin
		 *
		 * @returns {@link PFLO.plugins.History} The History plugin for chaining
		 * @memberof PFLO.plugins.History
		 */
		enable: function() {
			impl.enabled = true;
			return this;
		}
	};

	/* eslint-disable no-loop-func */
	// create backwards compatible plugins that now use History
	for (var i = 0; i < impl.DEPRECATED_PLUGINS.length; i++) {
		var plugin_name = impl.DEPRECATED_PLUGINS[i];
		PFLO.plugins[plugin_name] = PFLO.plugins.History;

		PFLO.plugins[plugin_name] = {
			init: (function(_plugin_name) {
				return function(config) {
					PFLO.utils.pluginConfig(impl, config, _plugin_name, ["enabled"]);

					if (impl.enabled) {
						debugLog("Deprecated: Initialized from " + _plugin_name + " config");
						PFLO.plugins.History.hook(undefined, undefined, {});
					}

					return PFLO.plugins[_plugin_name];
				};
			})(plugin_name),
			enable: PFLO.plugins.History.enable,
			// we don't want these plugins to have a `disable` function otherwise they will disable the History plugin
			hook: PFLO.plugins.History.hook,
			is_complete: PFLO.plugins.History.is_complete
		};

		// register as a SPA plugin (need this because the SPA plugin will look at each plugin config)
		PFLO.plugins.SPA.register(plugin_name);
	}
	/* eslint-enable no-loop-func */
}());
