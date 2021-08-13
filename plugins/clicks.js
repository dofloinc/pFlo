/**
 * The `Clicks` plugin tracks all mouse clicks on a page and beacons them to a dedicated endpoint on your server.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * The following parameters are sent when a click event is triggered.
 *
 * * `element`: The `nodeName` of the element that has been clicked (ie. `A`, `BUTTON`, `NAV`, etc.)
 * * `id`: The `id` of the element if specified
 * * `class`: The `class` attribute of the element
 * * `document_height`: The height of the `document`
 * * `document_width`: The width of the `document`
 * * `viewport_height`: The height of the viewport when the `click` event was triggered
 * * `viewport_width`: The width of the viewport when the `click` event was triggered
 *
 * @class PFLO.plugins.Clicks
 */
// w is the window object
(function(w) {
	var d = w.document;

	// Ensure PageFlo is defined
	PFLO = window.PFLO || {};
	PFLO.plugins = PFLO.plugins || {};

	if (PFLO.plugins.clicks) {
		return;
	}

	var impl = {
		// local vars
		click_url: "",
		onbeforeunload: false,
		retention: [],

		// functions
		handleEvent: function(event) {
			if (typeof impl.click_url === "undefined") {
				PFLO.error("No Beacon URL defined will not send beacon");
				return;
			}

			var target = null;
			if (event.target) { target = event.target; }
			else if (event.srcElement) { target = event.srcElement; }
			var document_res = impl.getDocumentSize();
			var viewport = impl.getViewport();
			var data = {
				element: target.nodeName,
				id: target.id,
				"class": target.classList,
				x: event.x,
				y: event.y,
				document_height: document_res.height,
				document_width: document_res.width,
				viewport_height: viewport.height,
				viewport_width: viewport.width
			};

			if (typeof impl.onbeforeunload === "undefined" || impl.onbeforeunload === false) {
				PFLO.info("No preference set for when to send clickstats, will default to send immediately");
				impl.sendData(data);
			}
			else {
				impl.retention.push(data);
			}
		},
		sendData: function(data) {
			var keys = Object.keys(data);
			var urlenc = "";
			for (var i in keys) {
				urlenc += keys[i] + "=" + data[keys[i]] + "&";
			}
			PFLO.info("Url-encoded string: " + urlenc);
			var url = impl.click_url + "?" + urlenc;
			var img = new Image();
			img.src = url;
			img.remove();
		},
		unload: function() {
			impl.retention.forEach(function(data){
				impl.sendData(data);
			});
		},
		getDocumentSize: function() {
			return {
				height: Math.max(
					d.body.scrollHeight, d.documentElement.scrollHeight,
					d.body.offsetHeight, d.documentElement.offsetHeight,
					d.body.clientHeight, d.documentElement.clientHeight
				),
				width: Math.max(
					d.body.scrollWidth, d.documentElement.scrollWidth,
					d.body.offsetWidth, d.documentElement.offsetWidth,
					d.body.clientWidth, d.documentElement.clientWidth
				)
			};
		},
		getViewport: function() {
			var viewPortWidth;
			var viewPortHeight;

			// the more standards compliant browsers (mozilla/netscape/opera/IE7)
			// use window.innerWidth and window.innerHeight
			if (typeof window.innerWidth !== "undefined") {
				viewPortWidth = window.innerWidth;
				viewPortHeight = window.innerHeight;
			}

			// IE6 in standards compliant mode (i.e. with a valid doctype as the
			// first line in the document)
			else if (typeof document.documentElement !== "undefined" &&
			    typeof document.documentElement.clientWidth !== "undefined" &&
			    document.documentElement.clientWidth !== 0) {
				viewPortWidth = document.documentElement.clientWidth;
				viewPortHeight = document.documentElement.clientHeight;
			}

			// older versions of IE
			else {
				viewPortWidth = document.getElementsByTagName("body")[0].clientWidth;
				viewPortHeight = document.getElementsByTagName("body")[0].clientHeight;
			}
			return {width: viewPortWidth, height: viewPortHeight};
		}
	};

	PFLO.plugins.Clicks = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} config.Clicks.click_url The URL the click events will be beaconed to.
		 * @param {boolean} [config.Clicks.onbeforeunload] A boolean value for when to send click events.  If this is `true`, clicks will be sent when the page is unloaded.  Otherwise, click events are sent immediately as they occur.
		 *
		 * @returns {@link PFLO.plugins.Clicks} The Clicks plugin for chaining
		 * @memberof PFLO.plugins.Clicks
		 */
		init: function(config) {
			var properties = [
				"click_url",     // URL to beacon
				"onbeforeunload" // Send the beacon when page is closed?
			];

			PFLO.utils.pluginConfig(impl, config, "Clicks", properties);

			// Other initialisation code here
			w.addEventListener("click", impl.handleEvent, true);
			w.addEventListener("beforeunload", impl.unload, true);

			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof PFLO.plugins.Clicks
		 */
		is_complete: function() {
			return true;
		}
	};
}(window));
