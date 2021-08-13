/**
 * @copyright (c) 2011, Yahoo! Inc.  All rights reserved.
 * @copyright (c) 2012, Log-Normal, Inc.  All rights reserved.
 * @copyright (c) 2012-2017, SOASTA, Inc. All rights reserved.
 * @copyright (c) 2017-2019, Akamai Technologies, Inc. All rights reserved.
 * @copyright (c) 2020-2021, doFlo, Inc.  All rights reserved.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE.txt file for terms.
 */

/**
 * @class document
 * @desc
 * the document class in the DOM
 */

/**
 * @class PFLO
 * @desc
 * pflo measures various performance characteristics of your user's browsing
 * experience and beacons it back to your server.
 *
 * To use this you'll need a web site, lots of users and the ability to do
 * something with the data you collect.  How you collect the data is up to
 * you, but we have a few ideas.
 *
 * Everything in pflo is accessed through the `PFLO` object, which is
 * available on `window.PFLO`.  It contains the public API, utility functions
 * ({@link PFLO.utils}) and all of the plugins ({@link PFLO.plugins}).
 *
 * Each plugin has its own API, but is reachable through {@link PFLO.plugins}.
 *
 * ## Beacon Parameters
 *
 * The core pflo object will add the following parameters to the beacon.
 *
 * Note that each individual {@link PFLO.plugins plugin} will add its own
 * parameters as well.
 *
 * * `v`: PageFlo version
 * * `sv`: PageFlo Loader Snippet version
 * * `sm`: PageFlo Loader Snippet method
 * * `u`: The page's URL (for most beacons), or the `XMLHttpRequest` URL
 * * `n`: The beacon number
 * * `pgu`: The page's URL (for `XMLHttpRequest` beacons)
 * * `pid`: Page ID (8 characters)
 * * `r`: Navigation referrer (from `document.location`)
 * * `vis.pre`: `1` if the page transitioned from prerender to visible
 * * `vis.st`: Document's visibility state when beacon was sent
 * * `vis.lh`: Timestamp when page was last hidden
 * * `vis.lv`: Timestamp when page was last visible
 * * `xhr.pg`: The `XMLHttpRequest` page group
 * * `errors`: Error messages of errors detected in PageFlo code, separated by a newline
 * * `rt.si`: Session ID
 * * `rt.ss`: Session start timestamp
 * * `rt.sl`: Session length (number of pages), can be increased by XHR beacons as well
 * * `ua.plt`: `navigator.platform`
 * * `ua.vnd`: `navigator.vendor`
 */

/**
 * @typedef TimeStamp
 * @type {number}
 *
 * @desc
 * A [Unix Epoch](https://en.wikipedia.org/wiki/Unix_time) timestamp (milliseconds
 * since 1970) created by [PFLO.now()]{@link PFLO.now}.
 *
 * If `DOMHighResTimeStamp` (`performance.now()`) is supported, it is
 * a `DOMHighResTimeStamp` (with microsecond resolution in the fractional),
 * otherwise, it is `Date.now()`.
 */

/* BEGIN_DEBUG */
// we don't yet have PFLO.utils.mark()
if ("performance" in window &&
	window.performance &&
	typeof window.performance.mark === "function" &&
	!window.PFLO_no_mark) {
	window.performance.mark("pflo:startup");
}
/* END_DEBUG */

/**
 * @global
 * @type {TimeStamp}
 * @desc
 * Timestamp the pflo.js script started executing.
 *
 * This has to be global so that we don't wait for this entire
 * script to download and execute before measuring the
 * time.  We also declare it without `var` so that we can later
 * `delete` it.  This is the only way that works on Internet Explorer.
 */
PFLO_start = new Date().getTime();

/**
 * @function
 * @global
 * @desc
 * Check the value of `document.domain` and fix it if incorrect.
 *
 * This function is run at the top of pflo, and then whenever
 * {@link PFLO.init} is called.  If pflo is running within an IFRAME, this
 * function checks to see if it can access elements in the parent
 * IFRAME.  If not, it will fudge around with `document.domain` until
 * it finds a value that works.
 *
 * This allows site owners to change the value of `document.domain` at
 * any point within their page's load process, and we will adapt to
 * it.
 *
 * @param {string} domain Domain name as retrieved from page URL
 */
function PFLO_check_doc_domain(domain) {
	/*eslint no-unused-vars:0*/
	var test;

	/* BEGIN_DEBUG */
	// we don't yet have PFLO.utils.mark()
	if ("performance" in window &&
		window.performance &&
		typeof window.performance.mark === "function" &&
		!window.PFLO_no_mark) {
		window.performance.mark("pflo:check_doc_domain");
	}
	/* END_DEBUG */

	if (!window) {
		return;
	}

	// If domain is not passed in, then this is a global call
	// domain is only passed in if we call ourselves, so we
	// skip the frame check at that point
	if (!domain) {
		// If we're running in the main window, then we don't need this
		if (window.parent === window || !document.getElementById("pflo-if-as")) {
			return;// true;	// nothing to do
		}

		if (window.PFLO && PFLO.pflo_frame && PFLO.window) {
			try {
				// If document.domain is changed during page load (from www.blah.com to blah.com, for example),
				// PFLO.window.location.href throws "Permission Denied" in IE.
				// Resetting the inner domain to match the outer makes location accessible once again
				if (PFLO.pflo_frame.document.domain !== PFLO.window.document.domain) {
					PFLO.pflo_frame.document.domain = PFLO.window.document.domain;
				}
			}
			catch (err) {
				if (!PFLO.isCrossOriginError(err)) {
					PFLO.addError(err, "PFLO_check_doc_domain.domainFix");
				}
			}
		}
		domain = document.domain;
	}

	if (!domain || domain.indexOf(".") === -1) {
		return;// false;	// not okay, but we did our best
	}

	// window.parent might be null if we're running during unload from
	// a detached iframe
	if (!window.parent) {
		return;
	}

	// 1. Test without setting document.domain
	try {
		test = window.parent.document;
		return;// test !== undefined;	// all okay
	}
	// 2. Test with document.domain
	catch (err) {
		try {
			document.domain = domain;
		}
		catch (err2) {
			// An exception might be thrown if the document is unloaded
			// or when the domain is incorrect.  If so, we can't do anything
			// more, so bail.
			return;
		}
	}

	try {
		test = window.parent.document;
		return;// test !== undefined;	// all okay
	}
	// 3. Strip off leading part and try again
	catch (err) {
		domain = domain.replace(/^[\w\-]+\./, "");
	}

	PFLO_check_doc_domain(domain);
}

PFLO_check_doc_domain();

// Construct PFLO
// w is window
(function(w) {
	var impl, pflo, d, createCustomEvent, dispatchEvent, visibilityState, visibilityChange, orig_w = w;

	// If the window that pflo is running in is not top level (ie, we're running in an iframe)
	// and if this iframe contains a script node with an id of "pflo-if-as",
	// Then that indicates that we are using the iframe loader, so the page we're trying to measure
	// is w.parent
	//
	// Note that we use `document` rather than `w.document` because we're specifically interested in
	// the document of the currently executing context rather than a passed in proxy.
	//
	// The only other place we do this is in `PFLO.utils.getMyURL` below, for the same reason, we
	// need the full URL of the currently executing (pflo) script.
	if (w.parent !== w &&
	    document.getElementById("pflo-if-as") &&
	    document.getElementById("pflo-if-as").nodeName.toLowerCase() === "script") {
		w = w.parent;
	}

	d = w.document;

	// Short namespace because I don't want to keep typing BOOMERANG
	if (!w.PFLO) {
		w.PFLO = {};
	}

	PFLO = w.PFLO;

	// don't allow this code to be included twice
	if (PFLO.version) {
		return;
	}

	/**
	 * PageFlo version, formatted as major.minor.patchlevel.
	 *
	 * This variable is replaced during build (`grunt build`).
	 *
	 * @type {string}
	 *
	 * @memberof PFLO
	 */
	PFLO.version = "%pflo_version%";

	/**
	 * The main document window.
	 * * If PageFlo was loaded in an IFRAME, this is the parent window
	 * * If PageFlo was loaded inline, this is the current window
	 *
	 * @type {Window}
	 *
	 * @memberof PFLO
	 */
	PFLO.window = w;

	/**
	 * The PageFlo frame:
	 * * If PageFlo was loaded in an IFRAME, this is the IFRAME
	 * * If PageFlo was loaded inline, this is the current window
	 *
	 * @type {Window}
	 *
	 * @memberof PFLO
	 */
	PFLO.pflo_frame = orig_w;

	/**
	 * @class PFLO.plugins
	 * @desc
	 * PageFlo plugin namespace.
	 *
	 * All plugins should add their plugin object to `PFLO.plugins`.
	 *
	 * A plugin should have, at minimum, the following exported functions:
	 * * `init(config)`
	 * * `is_complete()`
	 *
	 * See {@tutorial creating-plugins} for details.
	 */
	if (!PFLO.plugins) {
		PFLO.plugins = {};
	}

	// CustomEvent proxy for IE9 & 10 from https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
	(function() {
		try {
			if (new w.CustomEvent("CustomEvent") !== undefined) {
				createCustomEvent = function(e_name, params) {
					return new w.CustomEvent(e_name, params);
				};
			}
		}
		catch (ignore) {
			// empty
		}

		try {
			if (!createCustomEvent && d.createEvent && d.createEvent("CustomEvent")) {
				createCustomEvent = function(e_name, params) {
					var evt = d.createEvent("CustomEvent");
					params = params || { cancelable: false, bubbles: false };
					evt.initCustomEvent(e_name, params.bubbles, params.cancelable, params.detail);

					return evt;
				};
			}
		}
		catch (ignore) {
			// empty
		}

		if (!createCustomEvent && d.createEventObject) {
			createCustomEvent = function(e_name, params) {
				var evt = d.createEventObject();
				evt.type = evt.propertyName = e_name;
				evt.detail = params.detail;

				return evt;
			};
		}

		if (!createCustomEvent) {
			createCustomEvent = function() { return undefined; };
		}
	}());

	/**
	 * Dispatch a custom event to the browser
	 * @param {string} e_name The custom event name that consumers can subscribe to
	 * @param {object} e_data Any data passed to subscribers of the custom event via the `event.detail` property
	 * @param {boolean} async By default, custom events are dispatched immediately.
	 * Set to true if the event should be dispatched once the browser has finished its current
	 * JavaScript execution.
	 */
	dispatchEvent = function(e_name, e_data, async) {
		var ev = createCustomEvent(e_name, {"detail": e_data});
		if (!ev) {
			return;
		}

		function dispatch() {
			try {
				if (d.dispatchEvent) {
					d.dispatchEvent(ev);
				}
				else if (d.fireEvent) {
					d.fireEvent("onpropertychange", ev);
				}
			}
			catch (e) {
				PFLO.debug("Error when dispatching " + e_name);
			}
		}

		if (async) {
			PFLO.setImmediate(dispatch);
		}
		else {
			dispatch();
		}
	};

	// visibilitychange is useful to detect if the page loaded through prerender
	// or if the page never became visible
	// http://www.w3.org/TR/2011/WD-page-visibility-20110602/
	// http://www.nczonline.net/blog/2011/08/09/introduction-to-the-page-visibility-api/
	// https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API

	// Set the name of the hidden property and the change event for visibility
	if (typeof d.hidden !== "undefined") {
		visibilityState = "visibilityState";
		visibilityChange = "visibilitychange";
	}
	else if (typeof d.mozHidden !== "undefined") {
		visibilityState = "mozVisibilityState";
		visibilityChange = "mozvisibilitychange";
	}
	else if (typeof d.msHidden !== "undefined") {
		visibilityState = "msVisibilityState";
		visibilityChange = "msvisibilitychange";
	}
	else if (typeof d.webkitHidden !== "undefined") {
		visibilityState = "webkitVisibilityState";
		visibilityChange = "webkitvisibilitychange";
	}

	// impl is a private object not reachable from outside the PFLO object.
	// Users can set properties by passing in to the init() method.
	impl = {
		// Beacon URL
		beacon_url: "",

		// Forces protocol-relative URLs to HTTPS
		beacon_url_force_https: true,

		// List of string regular expressions that must match the beacon_url.  If
		// not set, or the list is empty, all beacon URLs are allowed.
		beacon_urls_allowed: [],

		// Beacon request method, either GET, POST or AUTO. AUTO will check the
		// request size then use GET if the request URL is less than MAX_GET_LENGTH
		// chars. Otherwise, it will fall back to a POST request.
		beacon_type: "AUTO",

		// Beacon authorization key value. Most systems will use the 'Authentication'
		// keyword, but some some services use keys like 'X-Auth-Token' or other
		// custom keys.
		beacon_auth_key: "Authorization",

		// Beacon authorization token. This is only needed if your are using a POST
		// and the beacon requires an Authorization token to accept your data.  This
		// disables use of the browser sendBeacon() API.
		beacon_auth_token: undefined,

		// Sends beacons with Credentials (applies to XHR beacons, not IMG or `sendBeacon()`).
		// If you need this, you may want to enable `beacon_disable_sendbeacon` as
		// `sendBeacon()` does not support credentials.
		beacon_with_credentials: false,

		// Disables navigator.sendBeacon() support
		beacon_disable_sendbeacon: false,

		// Strip out everything except last two parts of hostname.
		// This doesn't work well for domains that end with a country tld,
		// but we allow the developer to override site_domain for that.
		// You can disable all cookies by setting site_domain to a falsy value.
		site_domain: w.location.hostname.
					replace(/.*?([^.]+\.[^.]+)\.?$/, "$1").
					toLowerCase(),

		// User's ip address determined on the server.  Used for the BW cookie.
		user_ip: "",

		// Whether or not to send beacons on page load
		autorun: true,

		// Whether or not we've sent a page load beacon
		hasSentPageLoadBeacon: false,

		// document.referrer
		r: undefined,

		// strip_query_string: false,

		// onloadfired: false,

		// handlers_attached: false,

		// waiting_for_config: false,

		// All PageFlo cookies will be created with SameSite=Lax by default
		same_site_cookie: "Lax",

		// All PageFlo cookies will be without Secure attribute by default
		secure_cookie: false,

		// Sometimes we would like to be able to set the SameSite=None from a PageFlo plugin
		forced_same_site_cookie_none: false,

		events: {
			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when the page is usable by the user.
			 *
			 * By default this is fired when `window.onload` fires, but if you
			 * set `autorun` to false when calling {@link PFLO.init}, then you
			 * must explicitly fire this event by calling {@link PFLO#event:page_ready}.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload}
			 * @event PFLO#page_ready
			 * @property {Event} [event] Event triggering the page_ready
			 */
			"page_ready": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired just before the browser unloads the page.
			 *
			 * The first event of `window.pagehide`, `window.beforeunload`,
			 * or `window.unload` will trigger this.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/pagehide}
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload}
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onunload}
			 * @event PFLO#page_unload
			 */
			"page_unload": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired before the document is about to be unloaded.
			 *
			 * `window.beforeunload` will trigger this.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload}
			 * @event PFLO#before_unload
			 */
			"before_unload": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired on `document.DOMContentLoaded`.
			 *
			 * The `DOMContentLoaded` event is fired when the initial HTML document
			 * has been completely loaded and parsed, without waiting for stylesheets,
			 * images, and subframes to finish loading
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded}
			 * @event PFLO#dom_loaded
			 */
			"dom_loaded": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired on `document.visibilitychange`.
			 *
			 * The `visibilitychange` event is fired when the content of a tab has
			 * become visible or has been hidden.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/visibilitychange}
			 * @event PFLO#visibility_changed
			 */
			"visibility_changed": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when the `visibilityState` of the document has changed from
			 * `prerender` to `visible`
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Events/visibilitychange}
			 * @event PFLO#prerender_to_visible
			 */
			"prerender_to_visible": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when a beacon is about to be sent.
			 *
			 * The subscriber can still add variables to the beacon at this point,
			 * either by modifying the `vars` paramter or calling {@link PFLO.addVar}.
			 *
			 * @event PFLO#before_beacon
			 * @property {object} vars Beacon variables
			 */
			"before_beacon": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when a beacon was sent.
			 *
			 * The beacon variables cannot be modified at this point.  Any calls
			 * to {@link PFLO.addVar} or {@link PFLO.removeVar} will apply to the
			 * next beacon.
			 *
			 * Also known as `onbeacon`.
			 *
			 * @event PFLO#beacon
			 * @property {object} vars Beacon variables
			 */
			"beacon": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when the page load beacon has been sent.
			 *
			 * This event should only happen once on a page.  It does not apply
			 * to SPA soft navigations.
			 *
			 * @event PFLO#page_load_beacon
			 * @property {object} vars Beacon variables
			 */
			"page_load_beacon": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when an XMLHttpRequest has finished, or, if something calls
			 * {@link PFLO.responseEnd}.
			 *
			 * @event PFLO#xhr_load
			 * @property {object} data Event data
			 */
			"xhr_load": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when the `click` event has happened on the `document`.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onclick}
			 * @event PFLO#click
			 */
			"click": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when any `FORM` element is submitted.
			 *
			 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit}
			 * @event PFLO#form_submit
			 */
			"form_submit": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever new configuration data is applied via {@link PFLO.init}.
			 *
			 * Also known as `onconfig`.
			 *
			 * @event PFLO#config
			 * @property {object} data Configuration data
			 */
			"config": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever `XMLHttpRequest.open` is called.
			 *
			 * This event will only happen if {@link PFLO.plugins.AutoXHR} is enabled.
			 *
			 * @event PFLO#xhr_init
			 * @property {string} type XHR type ("xhr")
			 */
			"xhr_init": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever a SPA plugin is about to track a new navigation.
			 *
			 * @event PFLO#spa_init
			 * @property {string} navType Navigation type (`spa` or `spa_hard`)
			 * @property {object} param SPA navigation parameters
			 */
			"spa_init": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever a SPA navigation is complete.
			 *
			 * @event PFLO#spa_navigation
			 */
			"spa_navigation": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever a SPA navigation is cancelled.
			 *
			 * @event PFLO#spa_cancel
			 */
			"spa_cancel": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever `XMLHttpRequest.send` is called.
			 *
			 * This event will only happen if {@link PFLO.plugins.AutoXHR} is enabled.
			 *
			 * @event PFLO#xhr_send
			 * @property {object} xhr `XMLHttpRequest` object
			 */
			"xhr_send": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever and `XMLHttpRequest` has an error (if its `status` is
			 * set).
			 *
			 * This event will only happen if {@link PFLO.plugins.AutoXHR} is enabled.
			 *
			 * Also known as `onxhrerror`.
			 *
			 * @event PFLO#xhr_error
			 * @property {object} data XHR data
			 */
			"xhr_error": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever a page error has happened.
			 *
			 * This event will only happen if {@link PFLO.plugins.Errors} is enabled.
			 *
			 * Also known as `onerror`.
			 *
			 * @event PFLO#error
			 * @property {object} err Error
			 */
			"error": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever connection information changes via the
			 * Network Information API.
			 *
			 * This event will only happen if {@link PFLO.plugins.Mobile} is enabled.
			 *
			 * @event PFLO#netinfo
			 * @property {object} connection `navigator.connection`
			 */
			"netinfo": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired whenever a Rage Click is detected.
			 *
			 * This event will only happen if {@link PFLO.plugins.Continuity} is enabled.
			 *
			 * @event PFLO#rage_click
			 * @property {Event} e Event
			 */
			"rage_click": [],

			/**
			 * PageFlo event, subscribe via {@link PFLO.subscribe}.
			 *
			 * Fired when an early beacon is about to be sent.
			 *
			 * The subscriber can still add variables to the early beacon at this point
			 * by calling {@link PFLO.addVar}.
			 *
			 * This event will only happen if {@link PFLO.plugins.Early} is enabled.
			 *
			 * @event PFLO#before_early_beacon
			 * @property {object} data Event data
			 */
			"before_early_beacon": []
		},

		/**
		 * Public events
		 */
		public_events: {
			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onBeforePageFloBeacon", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Maps to {@link PFLO#event:before_beacon}
			 *
			 * @event document#onBeforePageFloBeacon
			 * @property {object} vars Beacon variables
			 *
			 */
			"before_beacon": "onBeforePageFloBeacon",

			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onPageFloBeacon", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Maps to {@link PFLO#event:before_beacon}
			 *
			 * @event document#onPageFloBeacon
			 * @property {object} vars Beacon variables
			 * 
 			 * @memberof document
			 */
			"beacon": "onPageFloBeacon",

			/**
			 * Public event (fired on `document`), and can be subscribed via
			 * `document.addEventListener("onPageFloLoaded", ...)` or
			 * `document.attachEvent("onpropertychange", ...)`.
			 *
			 * Fired when {@link PFLO} has loaded and can be used.
			 *
			 * @event document#onPageFloLoaded
			 */
			"onpfloloaded": "onPageFloLoaded"
		},

		/**
		 * Maps old event names to their updated name
		 */
		translate_events: {
			"onbeacon": "beacon",
			"onconfig": "config",
			"onerror": "error",
			"onxhrerror": "xhr_error"
		},

		/**
		 * Number of page_unload or before_unload callbacks registered
		 */
		unloadEventsCount: 0,

		/**
		 * Number of page_unload or before_unload callbacks called
		 */
		unloadEventCalled: 0,

		listenerCallbacks: {},

		vars: {},
		singleBeaconVars: {},

		/**
		 * Variable priority lists:
		 * -1 = first
		 *  1 = last
		 */
		varPriority: {
			"-1": {},
			"1": {}
		},

		errors: {},

		disabled_plugins: {},

		localStorageSupported: false,
		LOCAL_STORAGE_PREFIX: "_pflo_",

		/**
		 * Native functions that were overwritten and should be restored when
		 * the PageFlo IFRAME is unloaded
		 */
		nativeOverwrites: [],

		xb_handler: function(type) {
			return function(ev) {
				var target;
				if (!ev) { ev = w.event; }
				if (ev.target) { target = ev.target; }
				else if (ev.srcElement) { target = ev.srcElement; }
				if (target.nodeType === 3) {  // defeat Safari bug
					target = target.parentNode;
				}

				// don't capture events on flash objects
				// because of context slowdowns in PepperFlash
				if (target &&
				    target.nodeName &&
				    target.nodeName.toUpperCase() === "OBJECT" &&
				    target.type === "application/x-shockwave-flash") {
					return;
				}
				impl.fireEvent(type, target);
			};
		},

		clearEvents: function() {
			var eventName;

			for (eventName in this.events) {
				if (this.events.hasOwnProperty(eventName)) {
					this.events[eventName] = [];
				}
			}
		},

		clearListeners: function() {
			var type, i;

			for (type in impl.listenerCallbacks) {
				if (impl.listenerCallbacks.hasOwnProperty(type)) {
					// remove all callbacks -- removeListener is guaranteed
					// to remove the element we're calling with
					while (impl.listenerCallbacks[type].length) {
						PFLO.utils.removeListener(
						    impl.listenerCallbacks[type][0].el,
						    type,
						    impl.listenerCallbacks[type][0].fn);
					}
				}
			}

			impl.listenerCallbacks = {};
		},

		fireEvent: function(e_name, data) {
			var i, handler, handlers, handlersLen;

			e_name = e_name.toLowerCase();

			/* BEGIN_DEBUG */
			PFLO.utils.mark("fire_event");
			PFLO.utils.mark("fire_event:" + e_name + ":start");
			/* END_DEBUG */

			// translate old names
			if (this.translate_events[e_name]) {
				e_name = this.translate_events[e_name];
			}

			if (!this.events.hasOwnProperty(e_name)) {
				return;// false;
			}

			if (this.public_events.hasOwnProperty(e_name)) {
				dispatchEvent(this.public_events[e_name], data);
			}

			handlers = this.events[e_name];

			// Before we fire any event listeners, let's call real_sendBeacon() to flush
			// any beacon that is being held by the setImmediate.
			if (e_name !== "before_beacon" && e_name !== "beacon" && e_name !== "before_early_beacon") {
				PFLO.real_sendBeacon();
			}

			// only call handlers at the time of fireEvent (and not handlers that are
			// added during this callback to avoid an infinite loop)
			handlersLen = handlers.length;
			for (i = 0; i < handlersLen; i++) {
				try {
					handler = handlers[i];
					handler.fn.call(handler.scope, data, handler.cb_data);
				}
				catch (err) {
					PFLO.addError(err, "fireEvent." + e_name + "<" + i + ">");
				}
			}

			// remove any 'once' handlers now that we've fired all of them
			for (i = 0; i < handlersLen; i++) {
				if (handlers[i].once) {
					handlers.splice(i, 1);
					handlersLen--;
					i--;
				}
			}

			/* BEGIN_DEBUG */
			PFLO.utils.mark("fire_event:" + e_name + ":end");
			PFLO.utils.measure(
				"fire_event:" + e_name,
				"fire_event:" + e_name + ":start",
				"fire_event:" + e_name + ":end");
			/* END_DEBUG */

			return;// true;
		},

		spaNavigation: function() {
			// a SPA navigation occured, force onloadfired to true
			impl.onloadfired = true;
		},

		/**
		 * Determines whether a beacon URL is allowed based on
		 * `beacon_urls_allowed` config
		 *
		 * @param {string} url URL to test
		 *
		 */
		beaconUrlAllowed: function(url) {
			if (!impl.beacon_urls_allowed || impl.beacon_urls_allowed.length === 0) {
				return true;
			}

			for (var i = 0; i < impl.beacon_urls_allowed.length; i++) {
				var regEx = new RegExp(impl.beacon_urls_allowed[i]);
				if (regEx.exec(url)) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Checks browser for localStorage support
		 */
		checkLocalStorageSupport: function() {
			var name = impl.LOCAL_STORAGE_PREFIX + "clss";
			impl.localStorageSupported = false;

			// Browsers with cookies disabled or in private/incognito mode may throw an
			// error when accessing the localStorage variable
			try {
				// we need JSON and localStorage support
				if (!w.JSON || !w.localStorage) {
					return;
				}

				w.localStorage.setItem(name, name);
				impl.localStorageSupported = (w.localStorage.getItem(name) === name);
				w.localStorage.removeItem(name);
			}
			catch (ignore) {
				impl.localStorageSupported = false;
			}
		},

		/**
		 * Fired when the PageFlo IFRAME is unloaded.
		 *
		 * If PageFlo was loaded into the root document, this code
		 * will not run.
		 */
		onFrameUnloaded: function() {
			var i, prop;

			PFLO.isUnloaded = true;

			// swap the original function back in for any overwrites
			for (i = 0; i < impl.nativeOverwrites.length; i++) {
				prop = impl.nativeOverwrites[i];

				prop.obj[prop.functionName] = prop.origFn;
			}

			impl.nativeOverwrites = [];
		}
	};

	// We create a pflo object and then copy all its properties to PFLO so that
	// we don't overwrite anything additional that was added to PFLO before this
	// was called... for example, a plugin.
	pflo = {
		/**
		 * The timestamp when pflo.js showed up on the page.
		 *
		 * This is the value of `PFLO_start` we set earlier.
		 * @type {TimeStamp}
		 *
		 * @memberof PFLO
		 */
		t_start: PFLO_start,

		/**
		 * When the PageFlo plugins have all run.
		 *
		 * This value is generally set in zzz-last-plugin.js.
		 * @type {TimeStamp}
		 *
		 * @memberof PFLO
		 */
		t_end: undefined,

		/**
		 * URL of pflo.js.
		 *
		 * @type {string}
		 *
		 * @memberof PFLO
		 */
		url: "",

		/**
		 * (Optional) URL of configuration file
		 *
		 * @type {string}
		 *
		 * @memberof PFLO
		 */
		config_url: null,

		/**
		 * Whether or not PageFlo was loaded after the `onload` event.
		 *
		 * @type {boolean}
		 *
		 * @memberof PFLO
		 */
		loadedLate: false,

		/**
		 * Current number of beacons sent.
		 *
		 * Will be incremented and added to outgoing beacon as `n`.
		 *
		 * @type {number}
		 *
		 */
		beaconsSent: 0,

		/**
		 * Whether or not PageFlo thinks it has been unloaded (if it was
		 * loaded in an IFRAME)
		 *
		 * @type {boolean}
		 */
		isUnloaded: false,

		/**
		 * Whether or not we're in the middle of building a beacon.
		 *
		 * If so, the code desiring to send a beacon should wait until the beacon
		 * event and try again.  At that point, it should set this flag to true.
		 *
		 * @type {boolean}
		 */
		beaconInQueue: false,

		/*
		 * Cache of cookies set
		 */
		cookies: {},

		/**
		 * Whether or not we've tested cookie setting
		 */
		testedCookies: false,

		/**
		 * Constants visible to the world
		 * @class PFLO.constants
		 */
		constants: {
			/**
			 * SPA beacon types
			 *
			 * @type {string[]}
			 *
			 * @memberof PFLO.constants
			 */
			BEACON_TYPE_SPAS: ["spa", "spa_hard"],

			/**
			 * Maximum GET URL length.
			 * Using 2000 here as a de facto maximum URL length based on:
 			 * http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
			 *
			 * @type {number}
			 *
			 * @memberof PFLO.constants
			 */
			MAX_GET_LENGTH: 2000
		},

		/**
		 * Session data
		 * @class PFLO.session
		 */
		session: {
			/**
			 * Session Domain.
			 *
			 * You can disable all cookies by setting site_domain to a falsy value.
			 *
			 * @type {string}
			 *
			 * @memberof PFLO.session
			 */
			domain: impl.site_domain,

			/**
			 * Session ID.  This will be randomly generated in the client but may
			 * be overwritten by the server if not set.
			 *
			 * @type {string}
			 *
			 * @memberof PFLO.session
			 */
			ID: undefined,

			/**
			 * Session start time.
			 *
			 * @type {TimeStamp}
			 *
			 * @memberof PFLO.session
			 */
			start: undefined,

			/**
			 * Session length (number of pages)
			 *
			 * @type {number}
			 *
			 * @memberof PFLO.session
			 */
			length: 0,

			/**
			 * Session enabled (Are session cookies enabled?)
			 *
			 * @type {boolean}
			 *
			 * @memberof PFLO.session
			 */
			enabled: true
		},

		/**
		 * @class PFLO.utils
		 */
		utils: {
			/**
			 * Determines whether or not the browser has `postMessage` support
			 *
			 * @returns {boolean} True if supported
			 */
			hasPostMessageSupport: function() {
				if (!w.postMessage || typeof w.postMessage !== "function" && typeof w.postMessage !== "object") {
					return false;
				}
				return true;
			},

			/**
			 * Converts an object to a string.
			 *
			 * @param {object} o Object
			 * @param {string} separator Member separator
			 * @param {number} nest_level Number of levels to recurse
			 *
			 * @returns {string} String representation of the object
			 *
			 * @memberof PFLO.utils
			 */
			objectToString: function(o, separator, nest_level) {
				var value = [], k;

				if (!o || typeof o !== "object") {
					return o;
				}
				if (separator === undefined) {
					separator = "\n\t";
				}
				if (!nest_level) {
					nest_level = 0;
				}

				if (PFLO.utils.isArray(o)) {
					for (k = 0; k < o.length; k++) {
						if (nest_level > 0 && o[k] !== null && typeof o[k] === "object") {
							value.push(
								this.objectToString(
									o[k],
									separator + (separator === "\n\t" ? "\t" : ""),
									nest_level - 1
								)
							);
						}
						else {
							if (separator === "&") {
								value.push(encodeURIComponent(o[k]));
							}
							else {
								value.push(o[k]);
							}
						}
					}
					separator = ",";
				}
				else {
					for (k in o) {
						if (Object.prototype.hasOwnProperty.call(o, k)) {
							if (nest_level > 0 && o[k] !== null && typeof o[k] === "object") {
								value.push(encodeURIComponent(k) + "=" +
									this.objectToString(
										o[k],
										separator + (separator === "\n\t" ? "\t" : ""),
										nest_level - 1
									)
								);
							}
							else {
								if (separator === "&") {
									value.push(encodeURIComponent(k) + "=" + encodeURIComponent(o[k]));
								}
								else {
									value.push(k + "=" + o[k]);
								}
							}
						}
					}
				}

				return value.join(separator);
			},

			/**
			 * Gets the cached value of the cookie identified by `name`.
			 *
			 * @param {string} name Cookie name
			 *
			 * @returns {string|undefined} Cookie value, if set.
			 *
			 * @memberof PFLO.utils
			 */
			getCookie: function(name) {
				var cookieVal;

				if (!name) {
					return null;
				}

				/* BEGIN_DEBUG */
				PFLO.utils.mark("get_cookie");
				/* END_DEBUG */

				if (typeof PFLO.cookies[name] !== "undefined") {
					// a cached value of false indicates that the value doesn't exist, if so,
					// return undefined per the API
					return PFLO.cookies[name] === false ? undefined : PFLO.cookies[name];
				}

				// unknown value
				cookieVal = this.getRawCookie(name);
				if (typeof cookieVal === "undefined") {
					// set to false to indicate we've attempted to get this cookie
					PFLO.cookies[name] = false;

					// but return undefined per the API
					return undefined;
				}

				PFLO.cookies[name] = cookieVal;

				return PFLO.cookies[name];
			},

			/**
			 * Gets the value of the cookie identified by `name`.
			 *
			 * @param {string} name Cookie name
			 *
			 * @returns {string|null} Cookie value, if set.
			 *
			 * @memberof PFLO.utils
			 */
			getRawCookie: function(name) {
				if (!name) {
					return null;
				}

				/* BEGIN_DEBUG */
				PFLO.utils.mark("get_raw_cookie");
				/* END_DEBUG */

				name = " " + name + "=";

				var i, cookies;
				cookies = " " + d.cookie + ";";
				if ((i = cookies.indexOf(name)) >= 0) {
					i += name.length;
					return cookies.substring(i, cookies.indexOf(";", i)).replace(/^"/, "").replace(/"$/, "");
				}
			},

			/**
			 * Sets the cookie named `name` to the serialized value of `subcookies`.
			 *
			 * @param {string} name The name of the cookie
			 * @param {object} subcookies Key/value pairs to write into the cookie.
			 * These will be serialized as an & separated list of URL encoded key=value pairs.
			 * @param {number} max_age Lifetime in seconds of the cookie.
			 * Set this to 0 to create a session cookie that expires when
			 * the browser is closed. If not set, defaults to 0.
			 *
			 * @returns {boolean} True if the cookie was set successfully
			 *
			 * @example
			 * PFLO.utils.setCookie("RT", { s: t_start, r: url });
			 *
			 * @memberof PFLO.utils
			 */
			setCookie: function(name, subcookies, max_age) {
				var value, nameval, savedval, c, exp;

				if (!name || !PFLO.session.domain || typeof subcookies === "undefined") {
					PFLO.debug("Invalid parameters or site domain: " + name + "/" + subcookies + "/" + PFLO.session.domain);

					PFLO.addVar("nocookie", 1);
					return false;
				}

				/* BEGIN_DEBUG */
				PFLO.utils.mark("set_cookie");
				/* END_DEBUG */

				value = this.objectToString(subcookies, "&");

				if (value === PFLO.cookies[name]) {
					// no change
					return true;
				}

				nameval = name + "=\"" + value + "\"";

				if (nameval.length < 500) {
					c = [nameval, "path=/", "domain=" + PFLO.session.domain];
					if (typeof max_age === "number") {
						exp = new Date();
						exp.setTime(exp.getTime() + max_age * 1000);
						exp = exp.toGMTString();
						c.push("expires=" + exp);
					}

					var extraAttributes = this.getSameSiteAttributeParts();

					/**
					 * 1. We check if the Secure attribute wasn't added already because SameSite=None will force adding it.
					 * 2. We check the current protocol because if we are on HTTP and we try to create a secure cookie with
					 *    SameSite=Strict then a cookie will be created with SameSite=Lax.
					 */
					if (location.protocol === "https:" && impl.secure_cookie === true && extraAttributes.indexOf("Secure") === -1) {
						extraAttributes.push("Secure");
					}

					// add extra attributes
					c = c.concat(extraAttributes);

					/* BEGIN_DEBUG */
					PFLO.utils.mark("set_cookie_real");
					/* END_DEBUG */

					// set the cookie
					d.cookie = c.join("; ");

					// we only need to test setting the cookie once
					if (PFLO.testedCookies) {
						// only cache this cookie value if the expiry is in the future
						if (typeof max_age !== "number" || max_age > 0) {
							PFLO.cookies[name] = value;
						}
						else {
							// the cookie is going to expire right away, don't cache it
							PFLO.cookies[name] = undefined;
						}

						return true;
					}

					// unset the cached cookie value, in case the set doesn't work
					PFLO.cookies[name] = undefined;

					// confirm cookie was set (could be blocked by user's settings, etc.)
					savedval = this.getRawCookie(name);

					// the saved cookie should be the same or undefined in the case of removeCookie
					if (value === savedval ||
					    (typeof savedval === "undefined" && typeof max_age === "number" && max_age <= 0)) {
						// re-set the cached value
						PFLO.cookies[name] = value;

						// note we've saved successfully
						PFLO.testedCookies = true;

						PFLO.removeVar("nocookie");

						return true;
					}
					PFLO.warn("Saved cookie value doesn't match what we tried to set:\n" + value + "\n" + savedval);
				}
				else {
					PFLO.warn("Cookie too long: " + nameval.length + " " + nameval);
				}

				PFLO.addVar("nocookie", 1);
				return false;
			},

			/**
			 * Parse a cookie string returned by {@link PFLO.utils.getCookie} and
			 * split it into its constituent subcookies.
			 *
			 * @param {string} cookie Cookie value
			 *
			 * @returns {object} On success, an object of key/value pairs of all
			 * sub cookies. Note that some subcookies may have empty values.
			 * `null` if `cookie` was not set or did not contain valid subcookies.
			 *
			 * @memberof PFLO.utils
			 */
			getSubCookies: function(cookie) {
				var cookies_a,
				    i, l, kv,
				    gotcookies = false,
				    cookies = {};

				if (!cookie) {
					return null;
				}

				if (typeof cookie !== "string") {
					PFLO.debug("TypeError: cookie is not a string: " + typeof cookie);
					return null;
				}

				cookies_a = cookie.split("&");

				for (i = 0, l = cookies_a.length; i < l; i++) {
					kv = cookies_a[i].split("=");
					if (kv[0]) {
						kv.push("");  // just in case there's no value
						cookies[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
						gotcookies = true;
					}
				}

				return gotcookies ? cookies : null;
			},

			/**
			 * Removes the cookie identified by `name` by nullifying its value,
			 * and making it a session cookie.
			 *
			 * @param {string} name Cookie name
			 *
			 * @memberof PFLO.utils
			 */
			removeCookie: function(name) {
				return this.setCookie(name, {}, -86400);
			},

			/**
			 * Depending on PageFlo configuration and checks of current protocol and
			 * compatible browsers the logic below will provide an array of cookie
			 * attributes that are needed for a successful creation of a cookie that
			 * contains the SameSite attribute.
			 *
			 * How it works:
			 * 1. We read the PageFlo configuration key `same_site_cookie` where
			 *    one of the following values `None`, `Lax` or `Strict` is expected.
			 * 2. A configuration value of `same_site_cookie` will be read in case-insensitive
			 *    manner. E.g. `Lax`, `lax` and `lAx` will produce same result - `SameSite=Lax`.
			 * 3. If a `same_site_cookie` configuration value is not specified a cookie
			 *    will be created with `SameSite=Lax`.
			 * 4. If a `same_site_cookie` configuration value does't match any of
			 *    `None`, `Lax` or `Strict` then a cookie will be created with `SameSite=Lax`.
			 * 5. The `Secure` cookie attribute will be added when a cookie is created
			 *    with `SameSite=None`.
			 * 6. It's possible that a PageFlo plugin or external code may need cookies
			 *    to be created with `SameSite=None`. In such cases we check a special
			 *    flag `forced_same_site_cookie_none`. If the value of this flag is equal to `true`
			 *    then the `same_site_cookie` value will be ignored and PageFlo cookies
			 *    will be created with `SameSite=None`.
			 *
			 * SameSite=None - INCOMPATIBILITIES and EXCEPTIONS:
			 *
			 * There are known problems with older browsers where cookies created
			 * with `SameSite=None` are `dropped` or created with `SameSite=Strict`.
			 * Reference: https://www.chromium.org/updates/same-site/incompatible-clients
			 *
			 * 1. If we detect a browser that can't create safely a cookie with `SameSite=None`
			 *    then PageFlo will create a cookie without the `SameSite` attribute.
			 * 2. A cookie with `SameSite=None` can be created only over `HTTPS` connection.
			 *    If current connection is `HTTP` then a cookie will be created
			 *    without the `SameSite` attribute.
			 *
			 *
			 * @returns {Array} of cookie attributes used for setting a cookie with SameSite attribute
			 *
			 * @memberof PFLO.utils
			 */
			getSameSiteAttributeParts: function() {
				var sameSiteMode = impl.same_site_cookie.toUpperCase();

				if (impl.forced_same_site_cookie_none) {
					sameSiteMode = "NONE";
				}

				if (sameSiteMode === "LAX") {
					return ["SameSite=Lax"];
				}

				if (sameSiteMode === "NONE") {
					if (location.protocol === "https:" && this.isCurrentUASameSiteNoneCompatible()) {
						return ["SameSite=None", "Secure"];
					}

					// Fallback to browser's default
					return [];
				}

				if (sameSiteMode === "STRICT") {
					return ["SameSite=Strict"];
				}

				return ["SameSite=Lax"];
			},

			/**
			 * Retrieve items from localStorage
			 *
			 * @param {string} name Name of storage
			 *
			 * @returns {object|null} Returns object retrieved from localStorage.
			 *                       Returns undefined if not found or expired.
			 *                       Returns null if parameters are invalid or an error occured
			 *
			 * @memberof PFLO.utils
			 */
			getLocalStorage: function(name) {
				var value, data;
				if (!name || !impl.localStorageSupported) {
					return null;
				}

				/* BEGIN_DEBUG */
				PFLO.utils.mark("get_local_storage");
				/* END_DEBUG */

				try {
					value = w.localStorage.getItem(impl.LOCAL_STORAGE_PREFIX + name);
					if (value === null) {
						return undefined;
					}
					data = w.JSON.parse(value);
				}
				catch (e) {
					PFLO.warn(e);
					return null;
				}

				if (!data || typeof data.items !== "object") {
					// Items are invalid
					this.removeLocalStorage(name);
					return null;
				}
				if (typeof data.expires === "number") {
					if (PFLO.now() >= data.expires) {
						// Items are expired
						this.removeLocalStorage(name);
						return undefined;
					}
				}
				return data.items;
			},

			/**
			 * Saves items in localStorage
			 * The value stored in localStorage will be a JSON string representation of {"items": items, "expiry": expiry}
			 * where items is the object we're saving and expiry is an optional epoch number of when the data is to be
			 * considered expired
			 *
			 * @param {string} name Name of storage
			 * @param {object} items Items to be saved
			 * @param {number} max_age Age in seconds before items are to be considered expired
			 *
			 * @returns {boolean} True if the localStorage was set successfully
			 *
			 * @memberof PFLO.utils
			 */
			setLocalStorage: function(name, items, max_age) {
				var data, value, savedval;

				if (!name || !impl.localStorageSupported || typeof items !== "object") {
					return false;
				}

				/* BEGIN_DEBUG */
				PFLO.utils.mark("set_local_storage");
				/* END_DEBUG */

				data = {"items": items};

				if (typeof max_age === "number") {
					data.expires = PFLO.now() + (max_age * 1000);
				}

				value = w.JSON.stringify(data);

				if (value.length < 50000) {
					try {
						w.localStorage.setItem(impl.LOCAL_STORAGE_PREFIX + name, value);
						// confirm storage was set (could be blocked by user's settings, etc.)
						savedval = w.localStorage.getItem(impl.LOCAL_STORAGE_PREFIX + name);
						if (value === savedval) {
							return true;
						}
					}
					catch (ignore) {
						// Empty
					}
					PFLO.warn("Saved storage value doesn't match what we tried to set:\n" + value + "\n" + savedval);
				}
				else {
					PFLO.warn("Storage items too large: " + value.length + " " + value);
				}

				return false;
			},

			/**
			 * Remove items from localStorage
			 *
			 * @param {string} name Name of storage
			 *
			 * @returns {boolean} True if item was removed from localStorage.
			 *
			 * @memberof PFLO.utils
			 */
			removeLocalStorage: function(name) {
				if (!name || !impl.localStorageSupported) {
					return false;
				}
				try {
					w.localStorage.removeItem(impl.LOCAL_STORAGE_PREFIX + name);
					return true;
				}
				catch (ignore) {
					// Empty
				}
				return false;
			},

			/**
			 * Cleans up a URL by removing the query string (if configured), and
			 * limits the URL to the specified size.
			 *
			 * @param {string} url URL to clean
			 * @param {number} urlLimit Maximum size, in characters, of the URL
			 *
			 * @returns {string} Cleaned up URL
			 *
			 * @memberof PFLO.utils
			 */
			cleanupURL: function(url, urlLimit) {
				if (!url || PFLO.utils.isArray(url)) {
					return "";
				}

				if (impl.strip_query_string) {
					url = url.replace(/\?.*/, "?qs-redacted");
				}

				if (typeof urlLimit !== "undefined" && url && url.length > urlLimit) {
					// We need to break this URL up.  Try at the query string first.
					var qsStart = url.indexOf("?");
					if (qsStart !== -1 && qsStart < urlLimit) {
						url = url.substr(0, qsStart) + "?...";
					}
					else {
						// No query string, just stop at the limit
						url = url.substr(0, urlLimit - 3) + "...";
					}
				}

				return url;
			},

			/**
			 * Gets the URL with the query string replaced with a hash of its contents.
			 *
			 * @param {string} url URL
			 * @param {boolean} stripHash Whether or not to strip the hash
			 *
			 * @returns {string} URL with query string hashed
			 *
			 * @memberof PFLO.utils
			 */
			hashQueryString: function(url, stripHash) {
				if (!url) {
					return url;
				}
				if (!url.match) {
					PFLO.addError("TypeError: Not a string", "hashQueryString", typeof url);
					return "";
				}
				if (url.match(/^\/\//)) {
					url = location.protocol + url;
				}
				if (!url.match(/^(https?|file):/)) {
					PFLO.error("Passed in URL is invalid: " + url);
					return "";
				}
				if (stripHash) {
					url = url.replace(/#.*/, "");
				}
				return url.replace(/\?([^#]*)/, function(m0, m1) {
					return "?" + (m1.length > 10 ? PFLO.utils.hashString(m1) : m1);
				});
			},

			/**
			 * Sets the object's properties if anything in config matches
			 * one of the property names.
			 *
			 * @param {object} o The plugin's `impl` object within which it stores
			 * all its configuration and private properties
			 * @param {object} config The config object passed in to the plugin's
			 * `init()` method.
			 * @param {string} plugin_name The plugin's name in the {@link PFLO.plugins} object.
			 * @param {string[]} properties An array containing a list of all configurable
			 * properties that this plugin has.
			 *
			 * @returns {boolean} True if a property was set
			 *
			 * @memberof PFLO.utils
			 */
			pluginConfig: function(o, config, plugin_name, properties) {
				var i, props = 0;

				if (!config || !config[plugin_name]) {
					return false;
				}

				for (i = 0; i < properties.length; i++) {
					if (config[plugin_name][properties[i]] !== undefined) {
						o[properties[i]] = config[plugin_name][properties[i]];
						props++;
					}
				}

				return (props > 0);
			},

			/**
			 * `filter` for arrays
			 *
			 * @param {Array} array The array to iterate over.
			 * @param {Function} predicate The function invoked per iteration.
			 *
			 * @returns {Array} Returns the new filtered array.
			 *
			 * @memberof PFLO.utils
			 */
			arrayFilter: function(array, predicate) {
				var result = [];

				if (!(this.isArray(array) || (array && typeof array.length === "number")) ||
				    typeof predicate !== "function") {
					return result;
				}

				if (typeof array.filter === "function") {
					result = array.filter(predicate);
				}
				else {
					var index = -1,
					    length = array.length,
					    value;

					while (++index < length) {
						value = array[index];
						if (predicate(value, index, array)) {
							result[result.length] = value;
						}
					}
				}
				return result;
			},

			/**
			 * `find` for Arrays
			 *
			 * @param {Array} array The array to iterate over
			 * @param {Function} predicate The function invoked per iteration
			 *
			 * @returns {Array} Returns the value of first element that satisfies
			 * the predicate
			 *
			 * @memberof PFLO.utils
			 */
			arrayFind: function(array, predicate) {
				if (!(this.isArray(array) || (array && typeof array.length === "number")) ||
				    typeof predicate !== "function") {
					return undefined;
				}

				if (typeof array.find === "function") {
					return array.find(predicate);
				}
				else {
					var index = -1,
					    length = array.length,
					    value;

					while (++index < length) {
						value = array[index];
						if (predicate(value, index, array)) {
							return value;
						}
					}
					return undefined;
				}
			},

			/**
			 * MutationObserver feature detection
			 *
			 * @returns {boolean} Returns true if MutationObserver is supported.
			 * Always returns false for IE 11 due several bugs in it's implementation that MS flagged as Won't Fix.
			 * In IE11, XHR responseXML might be malformed if MO is enabled (where extra newlines get added in nodes with UTF-8 content).
			 * Another IE 11 MO bug can cause the process to crash when certain mutations occur.
			 * For the process crash issue, see https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8137215/ and
			 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15167323/
			 *
			 * @memberof PFLO.utils
			 */
			isMutationObserverSupported: function() {
				// We can only detect IE 11 bugs by UA sniffing.
				var ie11 = (w && w.navigator && w.navigator.userAgent && w.navigator.userAgent.match(/Trident.*rv[ :]*11\./));
				return (!ie11 && w && w.MutationObserver && typeof w.MutationObserver === "function");
			},

			/**
			 * The callback function may return a falsy value to disconnect the
			 * observer after it returns, or a truthy value to keep watching for
			 * mutations. If the return value is numeric and greater than 0, then
			 * this will be the new timeout. If it is boolean instead, then the
			 * timeout will not fire any more so the caller MUST call disconnect()
			 * at some point.
			 *
			 * @callback PFLO~addObserverCallback
			 * @param {object[]} mutations List of mutations detected by the observer or `undefined` if the observer timed out
			 * @param {object} callback_data Is the passed in `callback_data` parameter without modifications
			 */

			/**
			 * Add a MutationObserver for a given element and terminate after `timeout`ms.
			 *
			 * @param {DOMElement} el DOM element to watch for mutations
			 * @param {MutationObserverInit} config MutationObserverInit object (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit)
			 * @param {number} timeout Number of milliseconds of no mutations after which the observer should be automatically disconnected.
			 * If set to a falsy value, the observer will wait indefinitely for Mutations.
			 * @param {PFLO~addObserverCallback} callback Callback function to call either on timeout or if mutations are detected.
			 * @param {object} callback_data Any data to be passed to the callback function as its second parameter.
			 * @param {object} callback_ctx An object that represents the `this` object of the `callback` method.
			 * Leave unset the callback function is not a method of an object.
			 *
			 * @returns {object|null}
			 * - `null` if a MutationObserver could not be created OR
			 * - An object containing the observer and the timer object:
			 *   `{ observer: <MutationObserver>, timer: <Timeout Timer if any> }`
			 * - The caller can use this to disconnect the observer at any point
			 *   by calling `retval.observer.disconnect()`
			 * - Note that the caller should first check to see if `retval.observer`
			 *   is set before calling `disconnect()` as it may have been cleared automatically.
			 *
			 * @memberof PFLO.utils
			 */
			addObserver: function(el, config, timeout, callback, callback_data, callback_ctx) {
				var MO, zs, o = {observer: null, timer: null};

				/* BEGIN_DEBUG */
				PFLO.utils.mark("add_observer");
				/* END_DEBUG */

				if (!this.isMutationObserverSupported() || !callback || !el) {
					return null;
				}

				function done(mutations) {
					var run_again = false;

					/* BEGIN_DEBUG */
					PFLO.utils.mark("mutation_observer_callback");
					/* END_DEBUG */

					if (o.timer) {
						clearTimeout(o.timer);
						o.timer = null;
					}

					if (callback) {
						run_again = callback.call(callback_ctx, mutations, callback_data);

						if (!run_again) {
							callback = null;
						}
					}

					if (!run_again && o.observer) {
						o.observer.disconnect();
						o.observer = null;
					}

					if (typeof run_again === "number" && run_again > 0) {
						o.timer = setTimeout(done, run_again);
					}
				}

				MO = w.MutationObserver;
				// if the site uses Zone.js then get the native MutationObserver
				if (w.Zone && typeof w.Zone.__symbol__ === "function") {
					zs = w.Zone.__symbol__("MutationObserver");
					if (zs && typeof zs === "string" && w.hasOwnProperty(zs) && typeof w[zs] === "function") {
						PFLO.debug("Detected Zone.js, using native MutationObserver");
						MO = w[zs];
					}
				}
				o.observer = new MO(done);

				if (timeout) {
					o.timer = setTimeout(done, o.timeout);
				}

				o.observer.observe(el, config);

				return o;
			},

			/**
			 * Adds an event listener.
			 *
			 * @param {DOMElement} el DOM element
			 * @param {string} type Event name
			 * @param {function} fn Callback function
			 * @param {boolean|object} passiveOrOpts Passive mode or Options object
			 *
			 * @memberof PFLO.utils
			 */
			addListener: function(el, type, fn, passiveOrOpts) {
				var opts = false;

				/* BEGIN_DEBUG */
				PFLO.utils.mark("add_listener");
				/* END_DEBUG */

				if (el.addEventListener) {
					if (typeof passiveOrOpts === "object") {
						opts = passiveOrOpts;
					}
					else if (typeof passiveOrOpts === "boolean" && passiveOrOpts && PFLO.browser.supportsPassive()) {
						opts = {
							capture: false,
							passive: true
						};
					}

					el.addEventListener(type, fn, opts);
				}
				else if (el.attachEvent) {
					el.attachEvent("on" + type, fn);
				}

				// ensure the type arry exists
				impl.listenerCallbacks[type] = impl.listenerCallbacks[type] || [];

				// save a reference to the target object and function
				impl.listenerCallbacks[type].push({ el: el, fn: fn});
			},

			/**
			 * Removes an event listener.
			 *
			 * @param {DOMElement} el DOM element
			 * @param {string} type Event name
			 * @param {function} fn Callback function
			 *
			 * @memberof PFLO.utils
			 */
			removeListener: function(el, type, fn) {
				var i;

				/* BEGIN_DEBUG */
				PFLO.utils.mark("remove_listener");
				/* END_DEBUG */

				if (el.removeEventListener) {
					// NOTE: We don't need to match any other options (e.g. passive)
					// from addEventListener, as removeEventListener only cares
					// about captive.
					el.removeEventListener(type, fn, false);
				}
				else if (el.detachEvent) {
					el.detachEvent("on" + type, fn);
				}

				if (impl.listenerCallbacks.hasOwnProperty(type)) {
					for (var i = 0; i < impl.listenerCallbacks[type].length; i++) {
						if (fn === impl.listenerCallbacks[type][i].fn &&
						    el === impl.listenerCallbacks[type][i].el) {
							impl.listenerCallbacks[type].splice(i, 1);
							return;
						}
					}
				}
			},

			/**
			 * Determines if the specified object is an `Array` or not
			 *
			 * @param {object} ary Object in question
			 *
			 * @returns {boolean} True if the object is an `Array`
			 *
			 * @memberof PFLO.utils
			 */
			isArray: function(ary) {
				return Object.prototype.toString.call(ary) === "[object Array]";
			},

			/**
			 * Determines if the specified value is in the array
			 *
			 * @param {object} val Value to check
			 * @param {object} ary Object in question
			 *
			 * @returns {boolean} True if the value is in the Array
			 *
			 * @memberof PFLO.utils
			 */
			inArray: function(val, ary) {
				var i;

				if (typeof val === "undefined" || typeof ary === "undefined" || !ary.length) {
					return false;
				}

				for (i = 0; i < ary.length; i++) {
					if (ary[i] === val) {
						return true;
					}
				}

				return false;
			},

			/**
			 * Get a query parameter value from a URL's query string
			 *
			 * @param {string} param Query parameter name
			 * @param {string|Object} [url] URL containing the query string, or a link object.
			 * Defaults to `PFLO.window.location`
			 *
			 * @returns {string|null} URI decoded value or null if param isn't a query parameter
			 *
			 * @memberof PFLO.utils
			 */
			getQueryParamValue: function(param, url) {
				var l, params, i, kv;
				if (!param) {
					return null;
				}

				if (typeof url === "string") {
					l = PFLO.window.document.createElement("a");
					l.href = url;
				}
				else if (typeof url === "object" && typeof url.search === "string") {
					l = url;
				}
				else {
					l = PFLO.window.location;
				}

				// Now that we match, pull out all query string parameters
				params = l.search.slice(1).split(/&/);

				for (i = 0; i < params.length; i++) {
					if (params[i]) {
						kv = params[i].split("=");
						if (kv.length && kv[0] === param) {
							try {
								return kv.length > 1 ? decodeURIComponent(kv.splice(1).join("=").replace(/\+/g, " ")) : "";
							}
							catch (e) {
								/**
								 * We have different messages for the same error in different browsers but
								 * we can look at the error name because it looks more consistent.
								 *
								 * Examples:
								 *  - URIError: The URI to be encoded contains invalid character (Edge)
								 *  - URIError: malformed URI sequence (Firefox)
								 *  - URIError: URI malformed (Chrome)
								 *  - URIError: URI error (Safari 13.0) / Missing on MDN but this is the result of my local tests.
								 *
								 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Malformed_URI#Message
								 */
								if (e && typeof e.name === "string" && e.name.indexOf("URIError") !== -1) {
									// NOP
								}
								else {
									throw e;
								}
							}
						}
					}
				}
				return null;
			},

			/**
			 * Generates a pseudo-random UUID (Version 4):
			 * https://en.wikipedia.org/wiki/Universally_unique_identifier
			 *
			 * @returns {string} UUID
			 *
			 * @memberof PFLO.utils
			 */
			generateUUID: function() {
				return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0;
					var v = c === "x" ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},

			/**
			 * Generates a random ID based on the specified number of characters.  Uses
			 * characters a-z0-9.
			 *
			 * @param {number} chars Number of characters (max 40)
			 *
			 * @returns {string} Random ID
			 *
			 * @memberof PFLO.utils
			 */
			generateId: function(chars) {
				return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".substr(0, chars || 40).replace(/x/g, function(c) {
					var c = (Math.random() || 0.01).toString(36);

					// some implementations may return "0" for small numbers
					if (c === "0") {
						return "0";
					}
					else {
						return c.substr(2, 1);
					}
				});
			},

			/**
			 * Attempt to serialize an object, preferring JSURL over JSON.stringify
			 *
			 * @param {Object} value Object to serialize
			 * @returns {string} serialized version of value, empty-string if not possible
			 */
			serializeForUrl: function(value) {
				if (PFLO.utils.Compression && PFLO.utils.Compression.jsUrl) {
					return PFLO.utils.Compression.jsUrl(value);
				}

				if (window.JSON) {
					return JSON.stringify(value);
				}

				// not supported
				PFLO.debug("JSON is not supported");
				return "";
			},

			/**
			 * Attempt to identify the URL of pflo itself using multiple methods for cross-browser support
			 *
			 * This method uses document.currentScript (which cannot be called from an event handler), script.readyState (IE6-10),
			 * and the stack property of a caught Error object.
			 *
			 * @returns {string} The URL of the currently executing pflo script.
			 */
			getMyURL: function() {
				var stack;
				// document.currentScript works in all browsers except for IE: https://caniuse.com/#feat=document-currentscript
				// #pflo-if-as works in all browsers if the page uses our standard iframe loader
				// #pflo-scr-as works in all browsers if the page uses our preloader loader
				// PFLO_script will be undefined on IE for pages that do not use our standard loaders

				// Note that we do not use `w.document` or `d` here because we need the current execution context
				var PFLO_script = (document.currentScript || document.getElementById("pflo-if-as") || document.getElementById("pflo-scr-as"));

				if (PFLO_script) {
					return PFLO_script.src;
				}

				// For IE 6-10 users on pages not using the standard loader, we iterate through all scripts backwards
				var scripts = document.getElementsByTagName("script"), i;

				// i-- is both a decrement as well as a condition, ie, the loop will terminate when i goes from 0 to -1
				for (i = scripts.length; i--;) {
					// We stop at the first script that has its readyState set to interactive indicating that it is currently executing
					if (scripts[i].readyState === "interactive") {
						return scripts[i].src;
					}
				}

				// For IE 11, we throw an Error and inspect its stack property in the catch block
				// This also works on IE10, but throwing is disruptive so we try to avoid it and use
				// the less disruptive script iterator above
				try {
					throw new Error();
				}
				catch (e) {
					if ("stack" in e) {
						stack = this.arrayFilter(e.stack.split(/\n/), function(l) { return l.match(/https?:\/\//); });
						if (stack && stack.length) {
							return stack[0].replace(/.*(https?:\/\/.+?)(:\d+)+\D*$/m, "$1");
						}
					}
					// FWIW, on IE 8 & 9, the Error object does not contain a stack property, but if you have an uncaught error,
					// and a `window.onerror` handler (not using addEventListener), then the second argument to that handler is
					// the URL of the script that threw. The handler needs to `return true;` to prevent the default error handler
					// This flow is asynchronous though (due to the event handler), so won't work in a function return scenario
					// like this (we can't use promises because we would only need this hack in browsers that don't support promises).
				}

				return "";
			},

			/*
			 * Gets the Scroll x and y (rounded) for a page
			 *
			 * @returns {object} Scroll x and y coordinates
			 */
			scroll: function() {
				// Adapted from:
				// https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
				var supportPageOffset = w.pageXOffset !== undefined;
				var isCSS1Compat = ((w.document.compatMode || "") === "CSS1Compat");

				var ret = {
					x: 0,
					y: 0
				};

				if (supportPageOffset) {
					if (typeof w.pageXOffset === "function") {
						ret.x = w.pageXOffset();
						ret.y = w.pageYOffset();
					}
					else {
						ret.x = w.pageXOffset;
						ret.y = w.pageYOffset;
					}
				}
				else if (isCSS1Compat) {
					ret.x = w.document.documentElement.scrollLeft;
					ret.y = w.document.documentElement.scrollTop;
				}
				else {
					ret.x = w.document.body.scrollLeft;
					ret.y = w.document.body.scrollTop;
				}

				// round to full numbers
				if (typeof ret.sx === "number") {
					ret.sx = Math.round(ret.sx);
				}

				if (typeof ret.sy === "number") {
					ret.sy = Math.round(ret.sy);
				}

				return ret;
			},

			/**
			 * Gets the window height
			 *
			 * @returns {number} Window height
			 */
			windowHeight: function() {
				return w.innerHeight || w.document.documentElement.clientHeight || w.document.body.clientHeight;
			},

			/**
			 * Gets the window width
			 *
			 * @returns {number} Window width
			 */
			windowWidth: function() {
				return w.innerWidth || w.document.documentElement.clientWidth || w.document.body.clientWidth;
			},

			/**
			 * Determines if the function is native or not
			 *
			 * @param {function} fn Function
			 *
			 * @returns {boolean} True when the function is native
			 */
			isNative: function(fn) {
				return !!fn &&
				    fn.toString &&
				    !fn.hasOwnProperty("toString") &&
				    /\[native code\]/.test(String(fn));
			},

			/**
			 * Overwrites a function on the specified object.
			 *
			 * When the PageFlo IFRAME unloads, it will swap the old
			 * function back in, so calls to the functions are successful.
			 *
			 * If this isn't done, callers of the overwritten functions may still
			 * call into freed PageFlo code or the IFRAME that is partially unloaded,
			 * leading to "Freed script" errors or exceptions from accessing
			 * unloaded DOM properties.
			 *
			 * This tracking isn't needed if PageFlo is loaded in the root
			 * document, as everthing will be cleaned up along with PageFlo
			 * on unload.
			 *
			 * @param {object} obj Object whose property will be overwritten
			 * @param {string} functionName Function name
			 * @param {function} newFn New function
			 */
			overwriteNative: function(obj, functionName, newFn) {
				// bail if the object doesn't exist
				if (!obj || !newFn) {
					return;
				}

				// we only need to keep track if we're running PageFlo in
				// an IFRAME
				if (PFLO.pflo_frame !== PFLO.window) {
					// note we overwrote this
					impl.nativeOverwrites.push({
						obj: obj,
						functionName: functionName,
						origFn: obj[functionName]
					});
				}

				obj[functionName] = newFn;
			},

			/**
			 * Determines if the given input is an Integer.
			 * Relies on standard Number.isInteger() function that available
			 * is most browsers except IE. For IE, this relies on the polyfill
			 * provided by MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
			 *
			 * @param {number} input dat
			 *
			 * @returns {string} Random ID
			 *
			 * @memberof PFLO.utils
			 *
			 */
			isInteger: function(data) {
				var isInt = Number.isInteger || function(value) {
					return typeof value === "number" &&
						isFinite(value) &&
						Math.floor(value) === value;
				};

				return isInt(data);
			},

			/**
			 * Determines whether or not an Object is empty
			 *
			 * @param {object} data Data object
			 *
			 * @returns {boolean} True if the object has no properties
			 */
			isObjectEmpty: function(data) {
				for (var propName in data) {
					if (data.hasOwnProperty(propName)) {
						return false;
					}
				}

				return true;
			},

			/**
			 * Calculates the FNV hash of the specified string.
			 *
			 * @param {string} string Input string
			 *
			 * @returns {string} FNV hash of the input string
			 *
			 */
			hashString: function(string) {
				string = encodeURIComponent(string);
				var hval = 0x811c9dc5;

				for (var i = 0; i < string.length; i++) {
					hval = hval ^ string.charCodeAt(i);
					hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
				}

				var hash = (hval >>> 0).toString() + string.length;

				return parseInt(hash).toString(36);
			},

			/**
			 * Wrapper of isUASameSiteNoneCompatible() that ensures that we pass correct User Agent string
			 *
			 * @returns {boolean} True if a browser can safely create SameSite=None cookie
			 *
			 * @memberof PFLO.utils
			 */
			isCurrentUASameSiteNoneCompatible: function() {
				if (w && w.navigator && w.navigator.userAgent && typeof w.navigator.userAgent === "string") {
					return this.isUASameSiteNoneCompatible(w.navigator.userAgent);
				}

				return true;
			},

			/**
			 * @param {string} uaString User agent string
			 *
			 * @returns {boolean} True if a browser can safely create SameSite=None cookie
			 *
			 * @memberof PFLO.utils
			 */
			isUASameSiteNoneCompatible: function(uaString) {
				/**
				 * 1. UCBrowser lower than 12.13.2
				 */
				var result = uaString.match(/(UCBrowser)\/(\d+\.\d+)\.(\d+)/);

				if (result) {
					var ucMajorMinorPart = parseFloat(result[2]);
					var ucPatch = result[3];

					if (ucMajorMinorPart === 12.13) {
						if (ucPatch <= 2) {
							return false;
						}

						return true;
					}

					if (ucMajorMinorPart < 12.13) {
						return false;
					}

					return true;
				}

				/**
				 * 2. Chrome and Chromium version between 51 and 66
				 *
				 * This the regex covers both because a Chromium AU contains "Chromium/65.0.3325.181 Chrome/65.0.3325.181"
				 */
				result = uaString.match(/(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)/);

				if (result) {
					var chromeMajor = result[2];
					if (chromeMajor >= 51 && chromeMajor <= 66) {
						return false;
					}

					return true;
				}

				/**
				 * 3. Mac OS 10.14.* check
				 */
				result = uaString.match(/(Macintosh;.*Mac OS X 10_14[_\d]*.*) AppleWebKit\//);

				if (result) {
					// 3.2 Safari check
					result = uaString.match(/Version\/.* Safari\//);

					if (result) {
						// 3.2.1 Not Chrome based check
						result = uaString.match(/Chrom(?:e|ium)/);

						if (result === null) {
							return false;
						}
					}

					// 3.3 Mac OS embeded browser
					result = uaString.match(/^Mozilla\/\d+(?:\.\d+)* \(Macintosh;.*Mac OS X \d+(?:_\d+)*\) AppleWebKit\/\d+(?:\.\d+)* \(KHTML, like Gecko\)$/);

					if (result) {
						return false;
					}

					return true;
				}

				/**
				 * 4. iOS and iPad OS 12 for all browsers
				 */
				result = uaString.match(/(iP.+; CPU .*OS 12(?:_\d+)*.*)/);

				if (result) {
					return false;
				}

				return true;
			}

			/* BEGIN_DEBUG */
			/**
			 * DEBUG ONLY
			 *
			 * Loops over an array, running a function for each item
			 *
			 * @param {Array} array Array to iterate over
			 * @param {function} fn Function to execute
			 * @param {object} thisArg 'this' argument
			 */
			, forEach: function(array, fn, thisArg) {
				if (!PFLO.utils.isArray(array) || typeof fn !== "function") {
					return;
				}
				var length = array.length;
				for (var i = 0; i < length; i++) {
					if (array.hasOwnProperty(i)) {
						fn.call(thisArg, array[i], i, array);
					}
				}
			},

			/**
			 * DEBUG ONLY
			 *
			 * Logs a UserTiming mark
			 *
			 * @param {string} name Mark name (prefixed by pflo:)
			 */
			mark: function(name) {
				var p = PFLO.getPerformance();

				if (p && typeof p.mark === "function" && !PFLO.window.PFLO_no_mark) {
					p.mark("pflo:" + name);
				}
			},

			/**
			 * DEBUG ONLY
			 *
			 * Logs a UserTiming measure
			 *
			 * @param {string} name Mark name (prefixed by pflo:)
			 */
			measure: function(measureName, startMarkName, endMarkName) {
				var p = PFLO.getPerformance();

				if (p && typeof p.measure === "function" && !PFLO.window.PFLO_no_mark) {
					p.measure("pflo:" + measureName,
						startMarkName ? "pflo:" + startMarkName : undefined,
						endMarkName ? "pflo:" + endMarkName : undefined);
				}
			}
			/* END_DEBUG */

		}, // closes `utils`

		/**
		 * Browser feature detection flags.
		 *
		 * @class PFLO.browser
		 */
		browser: {
			results: {},

			/**
			 * Whether or not the browser supports 'passive' mode for event
			 * listeners
			 *
			 * @returns {boolean} True if the browser supports passive mode
			 */
			supportsPassive: function() {
				if (typeof PFLO.browser.results.supportsPassive === "undefined") {
					PFLO.browser.results.supportsPassive = false;

					if (!Object.defineProperty) {
						return false;
					}

					try {
						var opts = Object.defineProperty({}, "passive", {
							get: function() {
								PFLO.browser.results.supportsPassive = true;
							}
						});
						window.addEventListener("test", null, opts);
					}
					catch (e) {
						// NOP
					}
				}

				return PFLO.browser.results.supportsPassive;
			}
		},

		/**
		 * Initializes PageFlo by applying the specified configuration.
		 *
		 * All plugins' `init()` functions will be called with the same config as well.
		 *
		 * @param {object} config Configuration object
		 * @param {boolean} [config.autorun] By default, pflo runs automatically
		 * and attaches its `page_ready` handler to the `window.onload` event.
		 * If you set `autorun` to `false`, this will not happen and you will
		 * need to call {@link PFLO.page_ready} yourself.
		 * @param {string} config.beacon_auth_key Beacon authorization key value
		 * @param {string} config.beacon_auth_token Beacon authorization token.
		 * @param {boolean} config.beacon_with_credentials Sends beacon with credentials
		 * @param {boolean} config.beacon_disable_sendbeacon Disables `navigator.sendBeacon()` support
		 * @param {string} config.beacon_url The URL to beacon results back to.
		 * If not set, no beacon will be sent.
		 * @param {boolean} config.beacon_url_force_https Forces protocol-relative Beacon URLs to HTTPS
		 * @param {string} config.beacon_type `GET`, `POST` or `AUTO`
		 * @param {string} [config.site_domain] The domain that all cookies should be set on
		 * PageFlo will try to auto-detect this, but unless your site is of the
		 * `foo.com` format, it will probably get it wrong. It's a good idea
		 * to set this to whatever part of your domain you'd like to share
		 * bandwidth and performance measurements across.
		 * Set this to a falsy value to disable all cookies.
		 * @param {boolean} [config.strip_query_string] Whether or not to strip query strings from all URLs (e.g. `u`, `pgu`, etc.)
		 * @param {string} [config.user_ip] Despite its name, this is really a free-form
		 * string used to uniquely identify the user's current internet
		 * connection. It's used primarily by the bandwidth test to determine
		 * whether it should re-measure the user's bandwidth or just use the
		 * value stored in the cookie. You may use IPv4, IPv6 or anything else
		 * that you think can be used to identify the user's network connection.
		 * @param {string} [config.same_site_cookie] Used for creating cookies with `SameSite` with one of the following values: `None`, `Lax` or `Strict`.
		 * @param {boolean} [config.secure_cookie] When `true` all cookies will be created with `Secure` flag.
		 * @param {function} [config.log] Logger to use. Set to `null` to disable logging.
		 * @param {function} [<plugins>] Each plugin has its own section
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @memberof PFLO
		 */
		init: function(config) {
			var i, k,
			    properties = [
				    "autorun",
				    "beacon_auth_key",
				    "beacon_auth_token",
				    "beacon_with_credentials",
				    "beacon_disable_sendbeacon",
				    "beacon_url",
				    "beacon_url_force_https",
				    "beacon_type",
				    "site_domain",
				    "strip_query_string",
				    "user_ip",
				    "same_site_cookie",
				    "secure_cookie"
			    ];

			/* BEGIN_DEBUG */
			PFLO.utils.mark("init:start");
			/* END_DEBUG */

			PFLO_check_doc_domain();

			if (!config) {
				config = {};
			}

			// ensure logging is setup properly (or null'd out for production)
			if (config.log !== undefined) {
				this.log = config.log;
			}

			if (!this.log) {
				this.log = function(/* m,l,s */) {};
			}

			if (!this.pageId) {
				// generate a random page ID for this page's lifetime
				this.pageId = PFLO.utils.generateId(8);
				PFLO.debug("Generated PageID: " + this.pageId);
			}

			if (config.primary && impl.handlers_attached) {
				return this;
			}

			if (typeof config.site_domain !== "undefined") {
				if (/:/.test(config.site_domain)) {
					// domains with : are not valid, fall back to the current hostname
					config.site_domain = w.location.hostname.toLowerCase();
				}

				this.session.domain = config.site_domain;
			}

			if (PFLO.session.enabled && typeof PFLO.session.ID === "undefined") {
				PFLO.session.ID = PFLO.utils.generateUUID();
			}

			// Set autorun if in config right now, as plugins that listen for page_ready
			// event may fire when they .init() if onload has already fired, and whether
			// or not we should fire page_ready depends on config.autorun.
			if (typeof config.autorun !== "undefined") {
				impl.autorun = config.autorun;
			}

			/* BEGIN_DEBUG */
			PFLO.utils.mark("init:plugins:start");
			/* END_DEBUG */

			for (k in this.plugins) {
				if (this.plugins.hasOwnProperty(k)) {
					// config[plugin].enabled has been set to false
					if (config[k] &&
					    config[k].hasOwnProperty("enabled") &&
					    config[k].enabled === false) {
						impl.disabled_plugins[k] = 1;

						if (typeof this.plugins[k].disable === "function") {
							this.plugins[k].disable();
						}

						continue;
					}

					// plugin was previously disabled
					if (impl.disabled_plugins[k]) {

						// and has not been explicitly re-enabled
						if (!config[k] ||
						    !config[k].hasOwnProperty("enabled") ||
						    config[k].enabled !== true) {
							continue;
						}

						if (typeof this.plugins[k].enable === "function") {
							this.plugins[k].enable();
						}

						// plugin is now enabled
						delete impl.disabled_plugins[k];
					}

					// plugin exists and has an init method
					if (typeof this.plugins[k].init === "function") {
						try {
							/* BEGIN_DEBUG */
							PFLO.utils.mark("init:plugins:" + k + ":start");
							/* END_DEBUG */

							this.plugins[k].init(config);

							/* BEGIN_DEBUG */
							PFLO.utils.mark("init:plugins:" + k + ":end");
							PFLO.utils.measure(
								"init:plugins:" + k,
								"init:plugins:" + k + ":start",
								"init:plugins:" + k + ":end");
							/* END_DEBUG */
						}
						catch (err) {
							PFLO.addError(err, k + ".init");
						}
					}
				}
			}

			/* BEGIN_DEBUG */
			PFLO.utils.mark("init:plugins:end");
			PFLO.utils.measure(
				"init:plugins",
				"init:plugins:start",
				"init:plugins:end");
			/* END_DEBUG */

			for (i = 0; i < properties.length; i++) {
				if (config[properties[i]] !== undefined) {
					impl[properties[i]] = config[properties[i]];
				}
			}

			// if it's the first call to init (handlers aren't attached) and we're not asked to wait OR
			// it's the second init call (handlers are attached) and we were previously waiting
			// then we set up the page ready autorun functionality
			if ((!impl.handlers_attached && !config.wait) || (impl.handlers_attached && impl.waiting_for_config)) {
				// The developer can override onload by setting autorun to false
				if (!impl.onloadfired && (impl.autorun === undefined || impl.autorun !== false)) {
					if (PFLO.hasBrowserOnloadFired()) {
						PFLO.loadedLate = true;
					}
					PFLO.attach_page_ready(PFLO.page_ready_autorun);
				}
				impl.waiting_for_config = false;
			}

			// only attach handlers once
			if (impl.handlers_attached) {
				/* BEGIN_DEBUG */
				PFLO.utils.mark("init:end");
				PFLO.utils.measure(
					"init",
					"init:start",
					"init:end");
				/* END_DEBUG */

				return this;
			}

			if (config.wait) {
				impl.waiting_for_config = true;
			}

			PFLO.attach_page_ready(function() {
				// if we're not using the loader snippet, save the onload time for
				// browsers that do not support NavigationTiming.
				// This will be later than onload if pflo arrives late on the
				// page but it's the best we can do
				if (!PFLO.t_onload) {
					PFLO.t_onload = PFLO.now();
				}
			});

			PFLO.utils.addListener(w, "DOMContentLoaded", function() { impl.fireEvent("dom_loaded"); });

			PFLO.fireEvent("config", config);
			PFLO.subscribe("config", function(beaconConfig) {
				if (beaconConfig.beacon_url) {
					impl.beacon_url = beaconConfig.beacon_url;
				}
			});

			PFLO.subscribe("spa_navigation", impl.spaNavigation, null, impl);

			(function() {
				var forms, iterator;
				if (visibilityChange !== undefined) {
					PFLO.utils.addListener(d, visibilityChange, function() { impl.fireEvent("visibility_changed"); });

					// save the current visibility state
					impl.lastVisibilityState = PFLO.visibilityState();

					PFLO.subscribe("visibility_changed", function() {
						var visState = PFLO.visibilityState();

						// record the last time each visibility state occurred
						PFLO.lastVisibilityEvent[visState] = PFLO.now();
						PFLO.debug("Visibility changed from " + impl.lastVisibilityState + " to " + visState);

						// if we transitioned from prerender to hidden or visible, fire the prerender_to_visible event
						if (impl.lastVisibilityState === "prerender" &&
						    visState !== "prerender") {
							// note that we transitioned from prerender on the beacon for debugging
							PFLO.addVar("vis.pre", "1");

							// let all listeners know
							impl.fireEvent("prerender_to_visible");
						}

						impl.lastVisibilityState = visState;
					});
				}

				PFLO.utils.addListener(d, "mouseup", impl.xb_handler("click"));

				forms = d.getElementsByTagName("form");
				for (iterator = 0; iterator < forms.length; iterator++) {
					PFLO.utils.addListener(forms[iterator], "submit", impl.xb_handler("form_submit"));
				}

				if (!w.onpagehide && w.onpagehide !== null) {
					// This must be the last one to fire
					// We only clear w on browsers that don't support onpagehide because
					// those that do are new enough to not have memory leak problems of
					// some older browsers
					PFLO.utils.addListener(w, "unload", function() {
						PFLO.window = w = null;
					});
				}

				// if we were loaded in an IFRAME, try to keep track if the IFRAME was unloaded
				if (PFLO.pflo_frame !== PFLO.window) {
					PFLO.utils.addListener(PFLO.pflo_frame, "unload", impl.onFrameUnloaded);
				}
			}());

			impl.handlers_attached = true;

			/* BEGIN_DEBUG */
			PFLO.utils.mark("init:end");
			PFLO.utils.measure(
				"init",
				"init:start",
				"init:end");
			/* END_DEBUG */

			return this;
		},

		/**
		 * Attach a callback to the `pageshow` or `onload` event if `onload` has not
		 * been fired otherwise queue it to run immediately
		 *
		 * @param {function} cb Callback to run when `onload` fires or page is visible (`pageshow`)
		 *
		 * @memberof PFLO
		 */
		attach_page_ready: function(cb) {
			if (PFLO.hasBrowserOnloadFired()) {
				this.setImmediate(cb, null, null, PFLO);
			}
			else {
				// Use `pageshow` if available since it will fire even if page came from a back-forward page cache.
				// Browsers that support `pageshow` will not fire `onload` if navigation was through a back/forward button
				// and the page was retrieved from back-forward cache.
				if (w.onpagehide || w.onpagehide === null) {
					PFLO.utils.addListener(w, "pageshow", cb);
				}
				else {
					PFLO.utils.addListener(w, "load", cb);
				}
			}
		},

		/**
		 * Sends the `page_ready` event only if `autorun` is still true after
		 * {@link PFLO.init} is called.
		 *
		 * @param {Event} ev Event
		 *
		 * @memberof PFLO
		 */
		page_ready_autorun: function(ev) {
			if (impl.autorun) {
				PFLO.page_ready(ev, true);
			}
		},

		/**
		 * Method that fires the {@link PFLO#event:page_ready} event. Call this
		 * only if you've set `autorun` to `false` when calling the {@link PFLO.init}
		 * method. You should call this method when you determine that your page
		 * is ready to be used by your user. This will be the end-time used in
		 * the page load time measurement. Optionally, you can pass a Unix Epoch
		 * timestamp as a parameter or set the global `PFLO_page_ready` var that will
		 * be used as the end-time instead.
		 *
		 * @param {Event|number} [ev] Ready event or optional load event end timestamp if called manually
		 * @param {boolean} auto True if called by `page_ready_autorun`
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @example
		 * PFLO.init({ autorun: false, ... });
		 * // wait until the page is ready, i.e. your view has loaded
		 * PFLO.page_ready();
		 *
		 * @memberof PFLO
		 */
		page_ready: function(ev, auto) {
			var tm_page_ready;

			// a number can be passed as the first argument if called manually which
			// will be used as the loadEventEnd time
			if (!auto && typeof ev === "number") {
				tm_page_ready = ev;
				ev = null;
			}

			if (!ev) {
				ev = w.event;
			}

			if (!ev) {
				ev = {
					name: "load"
				};
			}

			// if we were called manually or global PFLO_page_ready was set then
			// add loadEventEnd and note this was 'pr' on the beacon
			if (!auto) {
				ev.timing = ev.timing || {};
				// use timestamp parameter or global PFLO_page_ready if set, otherwise use
				// the current timestamp
				if (tm_page_ready) {
					ev.timing.loadEventEnd = tm_page_ready;
				}
				else if (typeof w.PFLO_page_ready === "number") {
					ev.timing.loadEventEnd = w.PFLO_page_ready;
				}
				else {
					ev.timing.loadEventEnd = PFLO.now();
				}

				PFLO.addVar("pr", 1, true);
			}
			else if (typeof w.PFLO_page_ready === "number") {
				ev.timing = ev.timing || {};
				// the global PFLO_page_ready will override our loadEventEnd
				ev.timing.loadEventEnd = w.PFLO_page_ready;

				PFLO.addVar("pr", 1, true);
			}

			if (impl.onloadfired) {
				return this;
			}

			impl.fireEvent("page_ready", ev);
			impl.onloadfired = true;
			return this;
		},

		/**
		 * Determines whether or not the page's `onload` event has fired
		 *
		 * @returns {boolean} True if page's onload was called
		 */
		hasBrowserOnloadFired: function() {
			var p = PFLO.getPerformance();
			// if the document is `complete` then the `onload` event has already occurred, we'll fire the callback immediately.
			// When `document.write` is used to replace the contents of the page and inject pflo, the document `readyState`
			// will go from `complete` back to `loading` and then to `complete` again. The second transition to `complete`
			// doesn't fire a second `pageshow` event in some browsers (e.g. Safari). We need to check if
			// `performance.timing.loadEventStart` or `PFLO_onload` has occurred to detect this scenario. Will not work for
			// older Safari that doesn't have NavTiming
			return ((d.readyState && d.readyState === "complete") ||
			    (p && p.timing && p.timing.loadEventStart > 0) ||
			    w.PFLO_onload > 0);
		},

		/**
		 * Determines whether or not the page's `onload` event has fired, or
		 * if `autorun` is false, whether {@link PFLO.page_ready} was called.
		 *
		 * @returns {boolean} True if `onload` or {@link PFLO.page_ready} were called
		 *
		 * @memberof PFLO
		 */
		onloadFired: function() {
			return impl.onloadfired;
		},

		/**
		 * The callback function may return a falsy value to disconnect the observer
		 * after it returns, or a truthy value to keep watching for mutations. If
		 * the return value is numeric and greater than 0, then this will be the new timeout.
		 * If it is boolean instead, then the timeout will not fire any more so
		 * the caller MUST call disconnect() at some point
		 *
		 * @callback PFLO~setImmediateCallback
		 * @param {object} data The passed in `data` object
		 * @param {object} cb_data The passed in `cb_data` object
		 * @param {Error} callstack An Error object that holds the callstack for
		 * when `setImmediate` was called, used to determine what called the callback
		 */

		/**
		 * Defer the function `fn` until the next instant the browser is free from
		 * user tasks.
		 *
		 * @param {PFLO~setImmediateCallback} fn The callback function.
		 * @param {object} [data] Any data to pass to the callback function
		 * @param {object} [cb_data] Any passthrough data for the callback function.
		 * This differs from `data` when `setImmediate` is called via an event
		 * handler and `data` is the Event object
		 * @param {object} [cb_scope] The scope of the callback function if it is a method of an object
		 *
		 * @returns nothing
		 *
		 * @memberof PFLO
		 */
		setImmediate: function(fn, data, cb_data, cb_scope) {
			var cb, cstack;

			/* BEGIN_DEBUG */
			// DEBUG: This is to help debugging, we'll see where setImmediate calls were made from
			if (typeof Error !== "undefined") {
				cstack = new Error();
				cstack = cstack.stack ? cstack.stack.replace(/^Error/, "Called") : undefined;
			}
			/* END_DEBUG */

			cb = function() {
				fn.call(cb_scope || null, data, cb_data || {}, cstack);
				cb = null;
			};

			if (w.requestIdleCallback) {
				// set a timeout since rIC doesn't get called reliably in chrome headless
				w.requestIdleCallback(cb, {timeout: 1000});
			}
			else if (w.setImmediate) {
				w.setImmediate(cb);
			}
			else {
				setTimeout(cb, 10);
			}
		},

		/**
		 * Gets the current time in milliseconds since the Unix Epoch (Jan 1 1970).
		 *
		 * In browsers that support `DOMHighResTimeStamp`, this will be replaced
		 * by a function that adds `performance.now()` to `navigationStart`
		 * (with milliseconds.microseconds resolution).
		 *
		 * @function
		 *
		 * @returns {TimeStamp} Milliseconds since Unix Epoch
		 *
		 * @memberof PFLO
		 */
		now: (function() {
			return Date.now || function() { return new Date().getTime(); };
		}()),

		/**
		 * Gets the `window.performance` object of the root window.
		 *
		 * Checks vendor prefixes for older browsers (e.g. IE9).
		 *
		 * @returns {Performance|undefined} `window.performance` if it exists
		 *
		 * @memberof PFLO
		 */
		getPerformance: function() {
			try {
				if (PFLO.window) {
					if ("performance" in PFLO.window && PFLO.window.performance) {
						return PFLO.window.performance;
					}

					// vendor-prefixed fallbacks
					return PFLO.window.msPerformance ||
					    PFLO.window.webkitPerformance ||
					    PFLO.window.mozPerformance;
				}
			}
			catch (ignore) {
				// empty
			}
		},

		/**
		 * Allows us to force SameSite=None from a PageFlo plugin or a third party code.
		 *
		 * When this function is called then PageFlo won't honor "same_site_cookie"
		 * configuration key and won't attempt to return the default value of SameSite=Lax .
		 *
		 * @memberof PFLO
		 */
		forceSameSiteCookieNone: function() {
			impl.forced_same_site_cookie_none = true;
		},

		/**
		 * Get high resolution delta timestamp from time origin
		 *
		 * This function needs to approximate the time since the performance timeOrigin
		 * or Navigation Timing API's `navigationStart` time.
		 * If available, `performance.now()` can provide this value.
		 * If not we either get the navigation start time from the RT plugin or
		 * from `t_lstart` or `t_start`. Those values are subtracted from the current
		 * time to derive a time since `navigationStart` value.
		 *
		 * @returns {float} Exact or approximate time since the time origin.
		 */
		hrNow: function() {
			var now, navigationStart, p = PFLO.getPerformance();

			if (p && p.now) {
				now = p.now();
			}
			else {
				navigationStart = (PFLO.plugins.RT && PFLO.plugins.RT.navigationStart &&
					PFLO.plugins.RT.navigationStart()) || PFLO.t_lstart || PFLO.t_start;

				// if navigationStart is undefined, we'll be returning NaN
				now = PFLO.now() - navigationStart;
			}

			return now;
		},

		/**
		 * Gets the `document.visibilityState`, or `visible` if Page Visibility
		 * is not supported.
		 *
		 * @function
		 *
		 * @returns {string} Visibility state
		 *
		 * @memberof PFLO
		 */
		visibilityState: (visibilityState === undefined ? function() {
			return "visible";
		} : function() {
			return d[visibilityState];
		}),

		/**
		 * An mapping of visibliity event states to the latest time they happened
		 *
		 * @type {object}
		 *
		 * @memberof PFLO
		 */
		lastVisibilityEvent: {},

		/**
		 * Registers a PageFlo event.
		 *
		 * @param {string} e_name Event name
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @memberof PFLO
		 */
		registerEvent: function(e_name) {
			if (impl.events.hasOwnProperty(e_name)) {
				// already registered
				return this;
			}

			// create a new queue of handlers
			impl.events[e_name] = [];

			return this;
		},

		/**
		 * Disables pflo from doing anything further:
		 * 1. Clears event handlers (such as onload)
		 * 2. Clears all event listeners
		 *
		 * @memberof PFLO
		 */
		disable: function() {
			impl.clearEvents();
			impl.clearListeners();
		},

		/**
		 * Fires a PageFlo event
		 *
		 * @param {string} e_name Event name
		 * @param {object} data Event payload
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @memberof PFLO
		 */
		fireEvent: function(e_name, data) {
			return impl.fireEvent(e_name, data);
		},

		/**
		 * @callback PFLO~subscribeCallback
		 * @param {object} eventData Event data
		 * @param {object} cb_data Callback data
		 */

		/**
		 * Subscribes to a PageFlo event
		 *
		 * @param {string} e_name Event name, i.e. {@link PFLO#event:page_ready}.
		 * @param {PFLO~subscribeCallback} fn Callback function
		 * @param {object} cb_data Callback data, passed as the second parameter to the callback function
		 * @param {object} cb_scope Callback scope.  If set to an object, then the
		 * callback function is called as a method of this object, and all
		 * references to `this` within the callback function will refer to `cb_scope`.
		 * @param {boolean} once Whether or not this callback should only be run once
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @memberof PFLO
		 */
		subscribe: function(e_name, fn, cb_data, cb_scope, once) {
			var i, handler, ev;

			e_name = e_name.toLowerCase();

			/* BEGIN_DEBUG */
			PFLO.utils.mark("subscribe");
			PFLO.utils.mark("subscribe:" + e_name);
			/* END_DEBUG */

			// translate old names
			if (impl.translate_events[e_name]) {
				e_name = impl.translate_events[e_name];
			}

			if (!impl.events.hasOwnProperty(e_name)) {
				// allow subscriptions before they're registered
				impl.events[e_name] = [];
			}

			ev = impl.events[e_name];

			// don't allow a handler to be attached more than once to the same event
			for (i = 0; i < ev.length; i++) {
				handler = ev[i];
				if (handler && handler.fn === fn && handler.cb_data === cb_data && handler.scope === cb_scope) {
					return this;
				}
			}

			ev.push({
				fn: fn,
				cb_data: cb_data || {},
				scope: cb_scope || null,
				once: once || false
			});

			// attaching to page_ready after onload fires, so call soon
			if (e_name === "page_ready" && impl.onloadfired && impl.autorun) {
				this.setImmediate(fn, null, cb_data, cb_scope);
			}

			// Attach unload handlers directly to the window.onunload and
			// window.onbeforeunload events. The first of the two to fire will clear
			// fn so that the second doesn't fire. We do this because technically
			// onbeforeunload is the right event to fire, but not all browsers
			// support it.  This allows us to fall back to onunload when onbeforeunload
			// isn't implemented
			if (e_name === "page_unload" || e_name === "before_unload") {
				// Keep track of how many pagehide/unload/beforeunload handlers we're registering
				impl.unloadEventsCount++;

				(function() {
					var unload_handler, evt_idx = ev.length;

					unload_handler = function(evt) {
						if (fn) {
							fn.call(cb_scope, evt || w.event, cb_data);
						}

						// If this was the last pagehide/unload/beforeunload handler,
						// we'll try to send the beacon immediately after it is done.
						// The beacon will only be sent if one of the handlers has queued it.
						if (++impl.unloadEventCalled === impl.unloadEventsCount) {
							PFLO.real_sendBeacon();
						}
					};

					if (e_name === "page_unload") {
						// pagehide is for iOS devices
						// see http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
						if (w.onpagehide || w.onpagehide === null) {
							PFLO.utils.addListener(w, "pagehide", unload_handler);
						}
						else {
							PFLO.utils.addListener(w, "unload", unload_handler);
						}
					}
					PFLO.utils.addListener(w, "beforeunload", unload_handler);
				}());
			}

			return this;
		},

		/**
		 * Logs an internal PageFlo error.
		 *
		 * If the {@link PFLO.plugins.Errors} plugin is enabled, this data will
		 * be compressed on the `err` beacon parameter.  If not, it will be included
		 * in uncompressed form on the `errors` parameter.
		 *
		 * @param {string|object} err Error
		 * @param {string} [src] Source
		 * @param {object} [extra] Extra data
		 *
		 * @memberof PFLO
		 */
		addError: function PFLO_addError(err, src, extra) {
			var str, E = PFLO.plugins.Errors;

			/* BEGIN_DEBUG */
			PFLO.utils.mark("add_error");
			/* END_DEBUG */

			PFLO.error("PageFlo caught error: " + err + ", src: " + src + ", extra: " + extra);

			//
			// Use the Errors plugin if it's enabled
			//
			if (E && E.is_supported()) {
				if (typeof err === "string") {
					E.send({
						message: err,
						extra: extra,
						functionName: src,
						noStack: true
					}, E.VIA_APP, E.SOURCE_BOOMERANG);
				}
				else {
					if (typeof src === "string") {
						err.functionName = src;
					}

					if (typeof extra !== "undefined") {
						err.extra = extra;
					}

					E.send(err, E.VIA_APP, E.SOURCE_BOOMERANG);
				}

				return;
			}

			if (typeof err !== "string") {
				str = String(err);
				if (str.match(/^\[object/)) {
					str = err.name + ": " + (err.description || err.message).replace(/\r\n$/, "");
				}
				err = str;
			}
			if (src !== undefined) {
				err = "[" + src + ":" + PFLO.now() + "] " + err;
			}
			if (extra) {
				err += ":: " + extra;
			}

			if (impl.errors[err]) {
				impl.errors[err]++;
			}
			else {
				impl.errors[err] = 1;
			}
		},

		/**
		 * Determines if the specified Error is a Cross-Origin error.
		 *
		 * @param {string|object} err Error
		 *
		 * @returns {boolean} True if the Error is a Cross-Origin error.
		 *
		 * @memberof PFLO
		 */
		isCrossOriginError: function(err) {
			// These are expected for cross-origin iframe access.
			// For IE and Edge, we'll also check the error number for non-English browsers
			return err.name === "SecurityError" ||
				(err.name === "TypeError" && err.message === "Permission denied") ||
				(err.name === "Error" && err.message && err.message.match(/^(Permission|Access is) denied/)) ||
				err.number === -2146828218;  // IE/Edge error number for "Permission Denied"
		},

		/**
		 * Add one or more parameters to the beacon.
		 *
		 * This method may either be called with a single object containing
		 * key/value pairs, or with two parameters, the first is the variable
		 * name and the second is its value.
		 *
		 * All names should be strings usable in a URL's query string.
		 *
		 * We recommend only using alphanumeric characters and underscores, but you
		 * can use anything you like.
		 *
		 * Values should be strings (or numbers), and have the same restrictions
		 * as names.
		 *
		 * Parameters will be on all subsequent beacons unless `singleBeacon` is
		 * set. Early beacons will not clear vars that were set with `singleBeacon`.
		 *
		 * @param {string} name Variable name
		 * @param {string|object} val Value
		 * @param {boolean} singleBeacon Whether or not to add to a single beacon
		 * or all beacons.
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @example
		 * PFLO.addVar("page_id", 123);
		 * PFLO.addVar({"page_id": 123, "user_id": "Person1"});
		 *
		 * @memberof PFLO
		 */
		 addVar: function(name, value, singleBeacon) {
			/* BEGIN_DEBUG */
			PFLO.utils.mark("add_var");
			/* END_DEBUG */

			if (typeof name === "string") {
				impl.vars[name] = value;

				if (singleBeacon) {
					impl.singleBeaconVars[name] = 1;
				}
			}
			else if (typeof name === "object") {
				var o = name, k;
				for (k in o) {
					if (o.hasOwnProperty(k)) {
						impl.vars[k] = o[k];

						// remove after the first beacon
						if (singleBeacon) {
							impl.singleBeaconVars[k] = 1;
						}
					}
				}
			}

			return this;
		},

		/**
		 * Appends data to a beacon.
		 *
		 * If the value already exists, a comma is added and the new data is applied.
		 *
		 * @param {string} name Variable name
		 * @param {string} val Value
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @memberof PFLO
		 */
		appendVar: function(name, value) {
			var existing = PFLO.getVar(name) || "";
			if (existing) {
				existing += ",";
			}

			PFLO.addVar(name, existing + value);

			return this;
		},

		/**
		 * Removes one or more variables from the beacon URL. This is useful within
		 * a plugin to reset the values of parameters that it is about to set.
		 *
		 * Plugins can also use this in the {@link PFLO#event:beacon} event to clear
		 * any variables that should only live on a single beacon.
		 *
		 * This method accepts either a list of variable names, or a single
		 * array containing a list of variable names.
		 *
		 * @param {string[]|string} name Variable name or list
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @memberof PFLO
		 */
		removeVar: function(arg0) {
			var i, params;
			if (!arguments.length) {
				return this;
			}

			if (arguments.length === 1 && PFLO.utils.isArray(arg0)) {
				params = arg0;
			}
			else {
				params = arguments;
			}

			for (i = 0; i < params.length; i++) {
				if (impl.vars.hasOwnProperty(params[i])) {
					delete impl.vars[params[i]];
				}
			}

			return this;
		},

		/**
		 * Determines whether or not the beacon has the specified variable.
		 *
		 * @param {string} name Variable name
		 *
		 * @returns {boolean} True if the variable is set.
		 *
		 * @memberof PFLO
		 */
		hasVar: function(name) {
			return impl.vars.hasOwnProperty(name);
		},

		/**
		 * Gets the specified variable.
		 *
		 * @param {string} name Variable name
		 *
		 * @returns {object|undefined} Variable, or undefined if it isn't set
		 *
		 * @memberof PFLO
		 */
		getVar: function(name) {
			return impl.vars[name];
		},

		/**
		 * Sets a variable's priority in the beacon URL.
		 * -1 = beginning of the URL
		 * 0  = middle of the URL (default)
		 * 1  = end of the URL
		 *
		 * @param {string} name Variable name
		 * @param {number} pri Priority (-1 or 1)
		 *
		 * @returns {PFLO} PageFlo object
		 *
		 * @memberof PFLO
		 */
		setVarPriority: function(name, pri) {
			if (typeof pri !== "number" || Math.abs(pri) !== 1) {
				return this;
			}

			impl.varPriority[pri][name] = 1;

			return this;
		},

		/**
		 * Sets the Referrers variable.
		 *
		 * @param {string} r Referrer from the document.referrer
		 *
		 * @memberof PFLO
		 */
		setReferrer: function(r) {
			// document.referrer
			impl.r = r;
		},

		/**
		 * Starts a timer for a dynamic request.
		 *
		 * Once the named request has completed, call `loaded()` to send a beacon
		 * with the duration.
		 *
		 * @example
		 * var timer = PFLO.requestStart("my-timer");
		 * // do stuff
		 * timer.loaded();
		 *
		 * @param {string} name Timer name
		 *
		 * @returns {object} An object with a `.loaded()` function that you can call
		 *     when the dynamic timer is complete.
		 *
		 * @memberof PFLO
		 */
		requestStart: function(name) {
			var t_start = PFLO.now();
			PFLO.plugins.RT.startTimer("xhr_" + name, t_start);

			return {
				loaded: function(data) {
					PFLO.responseEnd(name, t_start, data);
				}
			};
		},

		/**
		 * Determines if PageFlo can send a beacon.
		 *
		 * Queryies all plugins to see if they implement `readyToSend()`,
		 * and if so, that they return `true`.
		 *
		 * If not, the beacon cannot be sent.
		 *
		 * @returns {boolean} True if PageFlo can send a beacon
		 *
		 * @memberof PFLO
		 */
		readyToSend: function() {
			var plugin;

			for (plugin in this.plugins) {
				if (this.plugins.hasOwnProperty(plugin)) {
					if (impl.disabled_plugins[plugin]) {
						continue;
					}

					if (typeof this.plugins[plugin].readyToSend === "function" &&
					    this.plugins[plugin].readyToSend() === false) {
						PFLO.debug("Plugin " + plugin + " is not ready to send");
						return false;
					}
				}
			}

			return true;
		},

		/**
		 * Sends a beacon for a dynamic request.
		 *
		 * @param {string|object} name Timer name or timer object data.
		 * @param {string} [name.initiator] Initiator, such as `xhr` or `spa`
		 * @param {string} [name.url] URL of the request
		 * @param {TimeStamp} t_start Start time
		 * @param {object} data Request data
		 * @param {TimeStamp} t_end End time
		 *
		 * @memberof PFLO
		 */
		responseEnd: function(name, t_start, data, t_end) {
			// take the now timestamp for start and end, if unspecified, in case we delay this beacon
			t_start = typeof t_start === "number" ? t_start : PFLO.now();
			t_end = typeof t_end === "number" ? t_end : PFLO.now();

			// wait until all plugins are ready to send
			if (!PFLO.readyToSend()) {
				PFLO.debug("Attempted to call responseEnd before all plugins were Ready to Send, trying again...");

				// try again later
				setTimeout(function() {
					PFLO.responseEnd(name, t_start, data, t_end);
				}, 1000);

				return;
			}

			// Wait until we've sent the Page Load beacon first
			if (!PFLO.hasSentPageLoadBeacon() &&
			    !PFLO.utils.inArray(name.initiator, PFLO.constants.BEACON_TYPE_SPAS)) {
				// wait for a beacon, then try again
				PFLO.subscribe("page_load_beacon", function() {
					PFLO.responseEnd(name, t_start, data, t_end);
				}, null, PFLO, true);

				return;
			}

			// Ensure we don't have two beacons trying to send data at the same time
			if (impl.beaconInQueue) {
				// wait until the beacon is sent, then try again
				PFLO.subscribe("beacon", function() {
					PFLO.responseEnd(name, t_start, data, t_end);
				}, null, PFLO, true);

				return;
			}

			// Lock the beacon queue
			impl.beaconInQueue = true;

			if (typeof name === "object") {
				if (!name.url) {
					PFLO.debug("PFLO.responseEnd: First argument must have a url property if it's an object");
					return;
				}

				impl.fireEvent("xhr_load", name);
			}
			else {
				// flush out any queue'd beacons before we set the Page Group
				// and timers
				PFLO.real_sendBeacon();

				PFLO.addVar("xhr.pg", name, true);

				PFLO.plugins.RT.startTimer("xhr_" + name, t_start);

				impl.fireEvent("xhr_load", {
					name: "xhr_" + name,
					data: data,
					timing: {
						loadEventEnd: t_end
					}
				});
			}
		},

		//
		// uninstrumentXHR, instrumentXHR, uninstrumentFetch and instrumentFetch
		// are stubs that will be replaced by auto-xhr.js if active.
		//
		/**
		 * Undo XMLHttpRequest instrumentation and reset the original `XMLHttpRequest`
		 * object
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link PFLO.plugins.AutoXHR}.
		 *
		 * @memberof PFLO
		 */
		uninstrumentXHR: function() { },

		/**
		 * Instrument all requests made via XMLHttpRequest to send beacons.
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link PFLO.plugins.AutoXHR}.
		 *
		 * @memberof PFLO
		 */
		instrumentXHR: function() { },

		/**
		 * Undo fetch instrumentation and reset the original `fetch`
		 * function
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link PFLO.plugins.AutoXHR}.
		 *
		 * @memberof PFLO
		 */
		uninstrumentFetch: function() { },

		/**
		 * Instrument all requests made via fetch to send beacons.
		 *
		 * This is implemented in `plugins/auto-xhr.js` {@link PFLO.plugins.AutoXHR}.
		 *
		 * @memberof PFLO
		 */
		instrumentFetch: function() { },

		/**
		 * Request pflo to send its beacon with all queued beacon data
		 * (via {@link PFLO.addVar}).
		 *
		 * PageFlo may ignore this request.
		 *
		 * When this method is called, pflo checks all plugins. If any
		 * plugin has not completed its checks (ie, the plugin's `is_complete()`
		 * method returns `false`, then this method does nothing.
		 *
		 * If all plugins have completed, then this method fires the
		 * {@link PFLO#event:before_beacon} event with all variables that will be
		 * sent on the beacon.
		 *
		 * After all {@link PFLO#event:before_beacon} handlers return, this method
		 * checks if a `beacon_url` has been configured and if there are any
		 * beacon parameters to be sent. If both are true, it fires the beacon.
		 *
		 * The {@link PFLO#event:beacon} event is then fired.
		 *
		 * `sendBeacon()` should be called any time a plugin goes from
		 * `is_complete() = false` to `is_complete = true` so the beacon is
		 * sent.
		 *
		 * The actual beaconing is handled in {@link PFLO.real_sendBeacon} after
		 * a short delay (via {@link PFLO.setImmediate}).  If other calls to
		 * `sendBeacon` happen before {@link PFLO.real_sendBeacon} is called,
		 * those calls will be discarded (so it's OK to call this in quick
		 * succession).
		 *
		 * @param {string} [beacon_url_override] Beacon URL override
		 *
		 * @memberof PFLO
		 */
		sendBeacon: function(beacon_url_override) {
			// This plugin wants the beacon to go somewhere else,
			// so update the location
			if (beacon_url_override) {
				impl.beacon_url_override = beacon_url_override;
			}

			if (!impl.beaconQueued) {
				impl.beaconQueued = true;
				PFLO.setImmediate(PFLO.real_sendBeacon, null, null, PFLO);
			}

			return true;
		},

		/**
		 * Sends a beacon when the beacon queue is empty.
		 *
		 * @param {object} params Beacon parameters to set
		 * @param {function} callback Callback to run when the queue is ready
		 * @param {object} that Function to apply callback to
		 */
		sendBeaconWhenReady: function(params, callback, that) {
			// If we're already sending a beacon, wait until the queue is empty
			if (impl.beaconInQueue) {
				// wait until the beacon is sent, then try again
				PFLO.subscribe("beacon", function() {
					PFLO.sendBeaconWhenReady(params, callback, that);
				}, null, PFLO, true);

				return;
			}

			// Lock the beacon queue
			impl.beaconInQueue = true;

			// add all parameters
			for (var paramName in params) {
				if (params.hasOwnProperty(paramName)) {
					// add this data to a single beacon
					PFLO.addVar(paramName, params[paramName], true);
				}
			}

			// run the callback
			if (typeof callback === "function" && typeof that !== "undefined") {
				callback.apply(that);
			}

			// send the beacon
			PFLO.sendBeacon();
		},

		/**
		 * Sends all beacon data.
		 *
		 * This function should be called directly any time a "new" beacon is about
		 * to be constructed.  For example, if you're creating a new XHR or other
		 * custom beacon, you should ensure the existing beacon data is flushed
		 * by calling `PFLO.real_sendBeacon();` first.
		 *
		 * @memberof PFLO
		 */
		real_sendBeacon: function() {
			var k, form, url, errors = [], params = [], paramsJoined, varsSent = {};

			if (!impl.beaconQueued) {
				return false;
			}

			/* BEGIN_DEBUG */
			PFLO.utils.mark("send_beacon:start");
			/* END_DEBUG */

			impl.beaconQueued = false;

			PFLO.debug("Checking if we can send beacon");

			// At this point someone is ready to send the beacon.  We send
			// the beacon only if all plugins have finished doing what they
			// wanted to do
			for (k in this.plugins) {
				if (this.plugins.hasOwnProperty(k)) {
					if (impl.disabled_plugins[k]) {
						continue;
					}
					if (!this.plugins[k].is_complete(impl.vars)) {
						PFLO.debug("Plugin " + k + " is not complete, deferring beacon send");
						return false;
					}
				}
			}

			// Sanity test that the browser is still available (and not shutting down)
			if (!window || !window.Image || !window.navigator || !PFLO.window) {
				PFLO.debug("DOM not fully available, not sending a beacon");
				return false;
			}

			// For SPA apps, don't strip hashtags as some SPA frameworks use #s for tracking routes
			// instead of History pushState() APIs. Use d.URL instead of location.href because of a
			// Safari bug.
			var isSPA = PFLO.utils.inArray(impl.vars["http.initiator"], PFLO.constants.BEACON_TYPE_SPAS);
			var isPageLoad = typeof impl.vars["http.initiator"] === "undefined" || isSPA;

			if (!impl.vars.pgu) {
				impl.vars.pgu = isSPA ? d.URL : d.URL.replace(/#.*/, "");
			}
			impl.vars.pgu = PFLO.utils.cleanupURL(impl.vars.pgu);

			// Use the current document.URL if it hasn't already been set, or for SPA apps,
			// on each new beacon (since each SPA soft navigation might change the URL)
			if (!impl.vars.u || isSPA) {
				impl.vars.u = impl.vars.pgu;
			}

			if (impl.vars.pgu === impl.vars.u) {
				delete impl.vars.pgu;
			}

			// Add cleaned-up referrer URLs to the beacon, if available
			if (impl.r) {
				impl.vars.r = PFLO.utils.cleanupURL(impl.r);
			}
			else {
				delete impl.vars.r;
			}

			impl.vars.v = PFLO.version;

			// Snippet version, if available
			if (PFLO.snippetVersion) {
				impl.vars.sv = PFLO.snippetVersion;
			}

			// Snippet method is IFRAME if not specified (pre-v12 snippets)
			impl.vars.sm = PFLO.snippetMethod || "i";

			if (PFLO.session.enabled) {
				impl.vars["rt.si"] = PFLO.session.ID + "-" + Math.round(PFLO.session.start / 1000).toString(36);
				impl.vars["rt.ss"] = PFLO.session.start;
				impl.vars["rt.sl"] = PFLO.session.length;
			}
			else {
				PFLO.removeVar("rt.si", "rt.ss", "rt.sl");
			}

			if (PFLO.visibilityState()) {
				impl.vars["vis.st"] = PFLO.visibilityState();
				if (PFLO.lastVisibilityEvent.visible) {
					impl.vars["vis.lv"] = PFLO.now() - PFLO.lastVisibilityEvent.visible;
				}
				if (PFLO.lastVisibilityEvent.hidden) {
					impl.vars["vis.lh"] = PFLO.now() - PFLO.lastVisibilityEvent.hidden;
				}
			}

			impl.vars["ua.plt"] = navigator.platform;
			impl.vars["ua.vnd"] = navigator.vendor;

			if (this.pageId) {
				impl.vars.pid = this.pageId;
			}

			// add beacon number
			impl.vars.n = ++this.beaconsSent;

			if (w !== window) {
				impl.vars["if"] = "";
			}

			for (k in impl.errors) {
				if (impl.errors.hasOwnProperty(k)) {
					errors.push(k + (impl.errors[k] > 1 ? " (*" + impl.errors[k] + ")" : ""));
				}
			}

			if (errors.length > 0) {
				impl.vars.errors = errors.join("\n");
			}

			impl.errors = {};

			// If we reach here, all plugins have completed
			impl.fireEvent("before_beacon", impl.vars);

			// clone the vars object for two reasons: first, so all listeners of
			// 'beacon' get an exact clone (in case listeners are doing
			// PFLO.removeVar), and second, to help build our priority list of vars.
			for (k in impl.vars) {
				if (impl.vars.hasOwnProperty(k)) {
					varsSent[k] = impl.vars[k];
				}
			}

			PFLO.removeVar(["qt", "pgu"]);

			if (typeof impl.vars.early === "undefined") {
				// remove any vars that should only be on a single beacon.
				// Early beacons don't clear vars even if flagged as `singleBeacon` so
				// that they can be re-sent on the next normal beacon
				for (var singleVarName in impl.singleBeaconVars) {
					if (impl.singleBeaconVars.hasOwnProperty(singleVarName)) {
						PFLO.removeVar(singleVarName);
					}
				}

				// clear single beacon vars list
				impl.singleBeaconVars = {};

				// keep track of page load beacons
				if (!impl.hasSentPageLoadBeacon && isPageLoad) {
					impl.hasSentPageLoadBeacon = true;

					// let this beacon go out first
					PFLO.setImmediate(function() {
						impl.fireEvent("page_load_beacon", varsSent);
					});
				}
			}

			// Stop at this point if we are rate limited
			if (PFLO.session.rate_limited) {
				PFLO.debug("Skipping because we're rate limited");
				return false;
			}

			// mark that we're no longer sending a beacon now, as those
			// paying attention to this will trigger at the beacon event
			impl.beaconInQueue = false;

			// send the beacon data
			PFLO.sendBeaconData(varsSent);

			/* BEGIN_DEBUG */
			PFLO.utils.mark("send_beacon:end");
			PFLO.utils.measure(
				"send_beacon",
				"send_beacon:start",
				"send_beacon:end");
			/* END_DEBUG */

			return true;
		},

		/**
		 * Sends beacon data via the Beacon API, XHR or Image
		 *
		 * @param {object} data Data
		 */
		sendBeaconData: function(data) {
			var urlFirst = [], urlLast = [], params, paramsJoined,
			    url, img, useImg = true, xhr, ret;

			PFLO.debug("Ready to send beacon: " + PFLO.utils.objectToString(data));

			// Use the override URL if given
			impl.beacon_url = impl.beacon_url_override || impl.beacon_url;

			// Check that the beacon_url was set first
			if (!impl.beacon_url) {
				PFLO.debug("No beacon URL, so skipping.");
				return false;
			}

			if (!impl.beaconUrlAllowed(impl.beacon_url)) {
				PFLO.debug("Beacon URL not allowed: " + impl.beacon_url);
				return false;
			}

			// Check that we have data to send
			if (PFLO.utils.isObjectEmpty(data)) {
				return false;
			}

			// If we reach here, we've figured out all of the beacon data we'll send.
			impl.fireEvent("beacon", data);

			// get high- and low-priority variables first, which remove any of
			// those vars from data
			urlFirst = this.getVarsOfPriority(data, -1);
			urlLast  = this.getVarsOfPriority(data, 1);

			// merge the 3 lists
			params = urlFirst.concat(this.getVarsOfPriority(data, 0), urlLast);
			paramsJoined = params.join("&");

			// If beacon_url is protocol relative, make it https only
			if (impl.beacon_url_force_https && impl.beacon_url.match(/^\/\//)) {
				impl.beacon_url = "https:" + impl.beacon_url;
			}

			// if there are already url parameters in the beacon url,
			// change the first parameter prefix for the pflo url parameters to &
			url = impl.beacon_url + ((impl.beacon_url.indexOf("?") > -1) ? "&" : "?") + paramsJoined;

			//
			// Try to send an IMG beacon if possible (which is the most compatible),
			// otherwise send an XHR beacon if the  URL length is longer than 2,000 bytes.
			//
			if (impl.beacon_type === "GET") {
				useImg = true;

				if (url.length > PFLO.constants.MAX_GET_LENGTH) {
					((window.console && (console.warn || console.log)) || function() {})("PageFlo: Warning: Beacon may not be sent via GET due to payload size > 2000 bytes");
				}
			}
			else if (impl.beacon_type === "POST" || url.length > PFLO.constants.MAX_GET_LENGTH) {
				// switch to a XHR beacon if the the user has specified a POST OR GET length is too long
				useImg = false;
			}

			//
			// Try the sendBeacon API first.
			// But if beacon_type is set to "GET", dont attempt
			// sendBeacon API call
			//
			if (w && w.navigator &&
			    typeof w.navigator.sendBeacon === "function" &&
			    PFLO.utils.isNative(w.navigator.sendBeacon) &&
			    typeof w.Blob === "function" &&
			    impl.beacon_type !== "GET" &&
			    // As per W3C, The sendBeacon method does not provide ability to pass any
			    // header other than 'Content-Type'. So if we need to send data with
			    // 'Authorization' header, we need to fallback to good old xhr.
			    typeof impl.beacon_auth_token === "undefined" &&
			    !impl.beacon_disable_sendbeacon) {
				// note we're using sendBeacon with &sb=1
				var blobData = new w.Blob([paramsJoined + "&sb=1"], {
					type: "application/x-www-form-urlencoded"
				});

				if (w.navigator.sendBeacon(impl.beacon_url, blobData)) {
					return true;
				}

				// sendBeacon was not successful, try Image or XHR beacons
			}

			// If we don't have XHR available, force an image beacon and hope
			// for the best
			if (!PFLO.orig_XMLHttpRequest && (!w || !w.XMLHttpRequest)) {
				useImg = true;
			}

			if (useImg) {
				//
				// Image beacon
				//

				// just in case Image isn't a valid constructor
				try {
					img = new Image();
				}
				catch (e) {
					PFLO.debug("Image is not a constructor, not sending a beacon");
					return false;
				}

				img.src = url;
			}
			else {
				//
				// XHR beacon
				//

				// Send a form-encoded XHR POST beacon
				xhr = new (PFLO.window.orig_XMLHttpRequest || PFLO.orig_XMLHttpRequest || PFLO.window.XMLHttpRequest)();
				try {
					this.sendXhrPostBeacon(xhr, paramsJoined);
				}
				catch (e) {
					// if we had an exception with the window XHR object, try our IFRAME XHR
					xhr = new PFLO.pflo_frame.XMLHttpRequest();
					this.sendXhrPostBeacon(xhr, paramsJoined);
				}
			}

			return true;
		},

		/**
		 * Determines whether or not a Page Load beacon has been sent.
		 *
		 * @returns {boolean} True if a Page Load beacon has been sent.
		 *
		 * @memberof PFLO
		 */
		hasSentPageLoadBeacon: function() {
			return impl.hasSentPageLoadBeacon;
		},

		/**
		 * Sends a beacon via XMLHttpRequest
		 *
		 * @param {object} xhr XMLHttpRequest object
		 * @param {object} [paramsJoined] XMLHttpRequest.send() argument
		 *
		 * @memberof PFLO
		 */
		sendXhrPostBeacon: function(xhr, paramsJoined) {
			xhr.open("POST", impl.beacon_url);

			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			if (typeof impl.beacon_auth_token !== "undefined") {
				if (typeof impl.beacon_auth_key === "undefined") {
					impl.beacon_auth_key = "Authorization";
				}

				xhr.setRequestHeader(impl.beacon_auth_key, impl.beacon_auth_token);
			}

			if (impl.beacon_with_credentials) {
				xhr.withCredentials = true;
			}

			xhr.send(paramsJoined);
		},

		/**
		 * Gets all variables of the specified priority
		 *
		 * @param {object} vars Variables (will be modified for pri -1 and 1)
		 * @param {number} pri Priority (-1, 0, or 1)
		 *
		 * @return {string[]} Array of URI-encoded vars
		 *
		 * @memberof PFLO
		 */
		getVarsOfPriority: function(vars, pri) {
			var name, url = [],
			    // if we were given a priority, iterate over that list
			    // else iterate over vars
			    iterVars = (pri !== 0 ? impl.varPriority[pri] : vars);

			for (name in iterVars) {
				// if this var is set, add it to our URL array
				if (iterVars.hasOwnProperty(name) && vars.hasOwnProperty(name)) {
					url.push(this.getUriEncodedVar(name, typeof vars[name] === "undefined" ? "" : vars[name]));

					// remove this name from vars so it isn't also added
					// to the non-prioritized list when pri=0 is called
					if (pri !== 0) {
						delete vars[name];
					}
				}
			}

			return url;
		},

		/**
		 * Gets a URI-encoded name/value pair.
		 *
		 * @param {string} name Name
		 * @param {string} value Value
		 *
		 * @returns {string} URI-encoded string
		 *
		 * @memberof PFLO
		 */
		getUriEncodedVar: function(name, value) {
			if (value === undefined || value === null) {
				value = "";
			}

			if (typeof value === "object") {
				value = PFLO.utils.serializeForUrl(value);
			}

			var result = encodeURIComponent(name) +
				"=" + encodeURIComponent(value);

			return result;
		},

		/**
		 * Gets the latest ResourceTiming entry for the specified URL.
		 *
		 * Default sort order is chronological startTime.
		 *
		 * @param {string} url Resource URL
		 * @param {function} [sort] Sort the entries before returning the last one
		 * @param {function} [filter] Filter the entries. Will be applied before sorting
		 *
		 * @returns {PerformanceEntry|undefined} Entry, or undefined if ResourceTiming is not
		 *  supported or if the entry doesn't exist
		 *
		 * @memberof PFLO
		 */
		getResourceTiming: function(url, sort, filter) {
			var entries, p = PFLO.getPerformance();

			try {
				if (p && typeof p.getEntriesByName === "function") {
					entries = p.getEntriesByName(url);
					if (!entries || !entries.length) {
						return;
					}
					if (typeof filter === "function") {
						entries = PFLO.utils.arrayFilter(entries, filter);
						if (!entries || !entries.length) {
							return;
						}
					}
					if (entries.length > 1 && typeof sort === "function") {
						entries.sort(sort);
					}
					return entries[entries.length - 1];
				}
			}
			catch (e) {
				PFLO.warn("getResourceTiming:" + e);
			}
		}

		/* BEGIN_DEBUG */,
		/**
		 * Sets the list of allowed Beacon URLs
		 *
		 * @param {string[]} urls List of string regular expressions
		 */
		setBeaconUrlsAllowed: function(urls) {
			impl.beacon_urls_allowed = urls;
		}
		/* END_DEBUG */
	};

	// if not already set already on PFLO, determine the URL
	if (!PFLO.url) {
		pflo.url = pflo.utils.getMyURL();
	}
	else {
		// canonicalize the URL
		var a = PFLO.window.document.createElement("a");
		a.href = PFLO.url;
		pflo.url = a.href;
	}

	delete PFLO_start;

	/**
	 * @global
	 * @type {TimeStamp}
	 * @name PFLO_lstart
	 * @desc
	 * Time the loader script started fetching pflo.js (if the asynchronous
	 * loader snippet is used).
	 */
	if (typeof PFLO_lstart === "number") {
		/**
		 * Time the loader script started fetching pflo.js (if using the
		 * asynchronous loader snippet) (`PFLO_lstart`)
		 * @type {TimeStamp}
		 *
		 * @memberof PFLO
		 */
		pflo.t_lstart = PFLO_lstart;
		delete PFLO_lstart;
	}
	else if (typeof PFLO.window.PFLO_lstart === "number") {
		pflo.t_lstart = PFLO.window.PFLO_lstart;
	}

	/**
	 * Time the `window.onload` event fired (if using the asynchronous loader snippet).
	 *
	 * This timestamp is logged in the case pflo.js loads after the onload event
	 * for browsers that don't support NavigationTiming.
	 *
	 * @global
	 * @name PFLO_onload
	 * @type {TimeStamp}
	 */
	if (typeof PFLO.window.PFLO_onload === "number") {
		/**
		 * Time the `window.onload` event fired (if using the asynchronous loader snippet).
		 *
		 * This timestamp is logged in the case pflo.js loads after the onload event
		 * for browsers that don't support NavigationTiming.
		 *
		 * @type {TimeStamp}
		 * @memberof PFLO
		 */
		pflo.t_onload = PFLO.window.PFLO_onload;
	}

	(function() {
		var make_logger;

		if (typeof console === "object" && console.log !== undefined) {
			/**
			 * Logs the message to the console
			 *
			 * @param {string} m Message
			 * @param {string} l Log level
			 * @param {string} [s] Source
			 *
			 * @function log
			 *
			 * @memberof PFLO
			 */
			pflo.log = function(m, l, s) {
				console.log("(" + PFLO.now() + ") " +
					"{" + PFLO.pageId + "}" +
					": " + s +
					": [" + l + "] " +
					m);
			};
		}
		else {
			// NOP for browsers that don't support it
			pflo.log = function() {};
		}

		make_logger = function(l) {
			return function(m, s) {
				this.log(m, l, "pflo" + (s ? "." + s : ""));
				return this;
			};
		};

		/**
		 * Logs debug messages to the console
		 *
		 * Debug messages are stripped out of production builds.
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function debug
		 *
		 * @memberof PFLO
		 */
		pflo.debug = make_logger("debug");

		/**
		 * Logs info messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function info
		 *
		 * @memberof PFLO
		 */
		pflo.info = make_logger("info");

		/**
		 * Logs warning messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function warn
		 *
		 * @memberof PFLO
		 */
		pflo.warn = make_logger("warn");

		/**
		 * Logs error messages to the console
		 *
		 * @param {string} m Message
		 * @param {string} [s] Source
		 *
		 * @function error
		 *
		 * @memberof PFLO
		 */
		pflo.error = make_logger("error");
	}());

	// If the browser supports performance.now(), swap that in for PFLO.now
	try {
		var p = pflo.getPerformance();
		if (p &&
		    typeof p.now === "function" &&
		    // #545 handle bogus performance.now from broken shims
		    /\[native code\]/.test(String(p.now)) &&
		    p.timing &&
		    p.timing.navigationStart) {
			pflo.now = function() {
				return Math.round(p.now() + p.timing.navigationStart);
			};
		}
	}
	catch (ignore) {
		// empty
	}

	impl.checkLocalStorageSupport();

	(function() {
		var ident;
		for (ident in pflo) {
			if (pflo.hasOwnProperty(ident)) {
				PFLO[ident] = pflo[ident];
			}
		}

		if (!PFLO.xhr_excludes) {
			/**
			 * URLs to exclude from automatic `XMLHttpRequest` instrumentation.
			 *
			 * You can put any of the following in it:
			 * * A full URL
			 * * A hostname
			 * * A path
			 *
			 * @example
			 * PFLO = window.PFLO || {};
			 * PFLO.xhr_excludes = {
			 *   "mysite.com": true,
			 *   "/dashboard/": true,
			 *   "https://mysite.com/dashboard/": true
			 * };
			 *
			 * @memberof PFLO
			 */
			PFLO.xhr_excludes = {};
		}
	}());

	/* BEGIN_DEBUG */
	/*
	 * This block reports on overridden functions on `window` and properties on `document` using `PFLO.warn()`.
	 * To enable, add `overridden` with a value of `true` to the query string.
	 */
	(function() {
		/**
		 * Checks a window for overridden functions.
		 *
		 * @param {Window} win The window object under test
		 *
		 * @returns {Array} Array of overridden function names
		 */
		PFLO.checkWindowOverrides = function(win) {
			if (!Object.getOwnPropertyNames) {
				return [];
			}

			var freshWindow, objects, overridden = [];
			function setup() {
				var iframe = d.createElement("iframe");
				iframe.style.display = "none";
				iframe.src = "javascript:false"; // eslint-disable-line no-script-url
				d.getElementsByTagName("script")[0].parentNode.appendChild(iframe);
				freshWindow = iframe.contentWindow;
				objects = Object.getOwnPropertyNames(freshWindow);
			}

			function teardown() {
				iframe.parentNode.removeChild(iframe);
			}

			function checkWindowObject(objectKey) {
				if (isNonNative(objectKey)) {
					overridden.push(objectKey);
				}
			}

			function isNonNative(key) {
				var split = key.split("."), fn = win, results = [];
				while (fn && split.length) {
					try {
						fn = fn[split.shift()];
					}
					catch (e) {
						return false;
					}
				}
				return typeof fn === "function" && !isNativeFunction(fn, key);
			}

			function isNativeFunction(fn, str) {
				if (str === "console.assert" ||
					str === "Function.prototype" ||
					str.indexOf("onload") >= 0 ||
					str.indexOf("onbeforeunload") >= 0 ||
					str.indexOf("onerror") >= 0 ||
					str.indexOf("onload") >= 0 ||
					str.indexOf("NodeFilter") >= 0) {
					return true;
				}
				return fn.toString &&
					!fn.hasOwnProperty("toString") &&
					/\[native code\]/.test(String(fn));
			}

			setup();
			for (var objectIndex = 0; objectIndex < objects.length; objectIndex++) {
				var objectKey = objects[objectIndex];
				if (objectKey === "window" ||
					objectKey === "self" ||
					objectKey === "top" ||
					objectKey === "parent" ||
					objectKey === "frames") {
					continue;
				}
				if (freshWindow[objectKey] &&
					(typeof freshWindow[objectKey] === "object" || typeof freshWindow[objectKey] === "function")) {
					checkWindowObject(objectKey);

					var propertyNames = [];
					try {
						propertyNames = Object.getOwnPropertyNames(freshWindow[objectKey]);
					}
					catch (e) {;}
					for (var i = 0; i < propertyNames.length; i++) {
						checkWindowObject([objectKey, propertyNames[i]].join("."));
					}

					if (freshWindow[objectKey].prototype) {
						propertyNames = Object.getOwnPropertyNames(freshWindow[objectKey].prototype);
						for (var i = 0; i < propertyNames.length; i++) {
							checkWindowObject([objectKey, "prototype", propertyNames[i]].join("."));
						}
					}
				}
			}
			return overridden;
		};

		/**
		 * Checks a document for overridden properties.
		 *
		 * @param {HTMLDocument} doc The document object under test
		 *
		 * @returns {Array} Array of overridden properties names
		 */
		PFLO.checkDocumentOverrides = function(doc) {
			return PFLO.utils.arrayFilter(["readyState", "domain", "hidden", "URL", "cookie"], function(key) {
				return doc.hasOwnProperty(key);
			});
		};

		if (PFLO.utils.getQueryParamValue("overridden") === "true" && w && w.Object && Object.getOwnPropertyNames) {
			var overridden = []
				.concat(PFLO.checkWindowOverrides(w))
				.concat(PFLO.checkDocumentOverrides(d));
			if (overridden.length > 0) {
				PFLO.warn("overridden: " + overridden.sort());
			}
		}
	})();
	/* END_DEBUG */

	dispatchEvent("onPageFloLoaded", { "PFLO": PFLO }, true);

}(window));

// end of pflo beaconing section
