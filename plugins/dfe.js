/**
 * Plugin to track cache utilization.
 *
 *
 * @class PFLO.plugins.DFE
 */
(function () {
	PFLO = window.PFLO || {};
	PFLO.plugins = PFLO.plugins || {};

	if (PFLO.plugins.DFE) {
		return;
	}

	var impl = {
		complete: false,
		// iframe: null,
		// base_url: "",
		base_url: "",
		t_start: null,
		t_dns: null,
		t_http: null,
		img: null,
		// gen_url: "",

		start: function () {
			if (impl.gen_url) {
				// already running
				return;
			}
			impl.complete = true;

			// var random = PFLO.utils.generateId(10);

			// impl.gen_url = impl.base_url.replace(/\*/, random);

			impl.img = new Image();
			impl.img.onload = impl.done;

			impl.t_start = new Date().getTime();
			impl.img.src = impl.base_url;
		}, 

		done: function () {
			// var random = PFLO.utils.generateId(10);

			impl.t_dns = new Date().getTime() - impl.t_start;

			impl.complete = true;
			// impl.img = new Image();
			// impl.img.onload = impl.B_loaded;

			// impl.t_start = new Date().getTime();
			// impl.img.src = impl.gen_url + "image-l.gif?t=" + random;
		},
	};

	PFLO.plugins.DFE = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} config.DNS.base_url The `base_url` parameter tells the DNS
		 * plugin where it can find its DNS testing images. This URL must contain
		 * a wildcard character (`*`) which will be replaced with a random string.
		 *
		 * The images will be appended to this string without any other modification.
		 *
		 * If you have any pages served over HTTPS, then this URL should be configured
		 * to work over HTTPS as well as HTTP.
		 *
		 * The protocol part of the URL will be automatically changed to fit the
		 * current document.
		 *
		 * @returns {@link PFLO.plugins.DNS} The DNS plugin for chaining
		 * @example
		 * PFLO.init({
		 *   DNS: {
		 *     base_url: "http://*.yoursite.com/images/"
		 *   }
		 * });
		 * @memberof PFLO.plugins.DNS
		 */
		init: function (config) {
			PFLO.utils.pluginConfig(impl, config, "DFE", ["base_url"]);

			if (impl.base_url === "") {
				impl.base_url = config.beacon_url.replace("/pageFlo", "/dateCheck");
			}

			if (config && config.wait) {
				return this;
			}

			// if (!impl.base_url) {
			// 	PFLO.warn("DNS.base_url is not set.  Cannot run DNS test.", "dns");
			// 	impl.complete = true;	// set to true so that is_complete doesn't
			// 							// block other plugins
			// 	return this;
			// }

			// // do not run test over https
			// if (PFLO.window.location.protocol === "https:") {
			// 	impl.complete = true;
			// 	return this;
			// }

			PFLO.subscribe("page_ready", impl.start, null, impl);

			return this;
		},

		/**
		 * Whether or not this plugin is complete
		 *
		 * @returns {boolean} `true` if the plugin is complete
		 * @memberof PFLO.plugins.DNS
		 */
		is_complete: function () {
			return impl.complete;
		},
	};
})();
