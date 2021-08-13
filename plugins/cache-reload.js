/**
 * The cache reload plugin forces the browser to update its cached copy of pflo.
 *
 * The file at `url` should look like the sample below.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds no parameters to the beacon.
 *
 * @example
 * <!doctype html>
 * <html>
 * <head>
 *   <script src="pflo.js"></script>
 * </head>
 * <body>
 *   <script>
 *   // required version needs to be passed in as a query string parameter
 *   // like v=0.9.123456789
 *   var boom_ver = PFLO.version.split('.'),
 *   var reqd_ver = location.search.replace(/.*v=([0-9\.]+)/, '$1').split('.');
 *   if ((boom_ver[0] < reqd_ver[0])
 *     || (boom_ver[0] == reqd_ver[0] && boom_ver[1] < reqd_ver[1])
 *     || (boom_ver[0] == reqd_ver[0] && boom_ver[1] == reqd_ver[1] && boom_ver[2] < reqd_ver[2])
 *   ) {
 *     location.reload(true);
 *   }
 *   </script>
 * </body>
 * </html>
 * @see {@link http://www.lognormal.com/blog/2012/06/05/updating-cached-pflo/}
 * @see {@link http://www.lognormal.com/blog/2012/06/17/more-on-updating-pflo/}
 *
 * @class PFLO.plugins.CACHE_RELOAD
 */
(function() {
	PFLO = window.PFLO || {};
	PFLO.plugins = PFLO.plugins || {};

	if (PFLO.plugins.CACHE_RELOAD) {
		return;
	}

	var impl = {
		url: ""
	};

	PFLO.plugins.CACHE_RELOAD = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} [config.CACHE_RELOAD.url] By default, this is set to the empty string,
		 * which has the effect of disabling the Cache Reload plugin.
		 *
		 * Set the `url` parameter to the URL that will do handle forcing the reload.
		 *
		 * See the example for what this URL's output should look like.
		 * @returns {@link PFLO.plugins.CACHE_RELOAD} The CACHE_RELOAD plugin for chaining
		 * @memberof PFLO.plugins.CACHE_RELOAD
		 */
		init: function(config) {
			PFLO.utils.pluginConfig(impl, config, "CACHE_RELOAD", ["url"]);

			if (!impl.url) {
				return this;
			}

			// we use document and not PFLO.window.document since
			// we can run inside the pflo iframe if any
			var i = document.createElement("iframe");
			i.style.display = "none";
			i.src = impl.url;
			document.body.appendChild(i);

			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof PFLO.plugins.CACHE_RELOAD
		 */
		is_complete: function() {
			// we always return true since this plugin never adds anything to the beacon
			return true;
		}
	};

}());
