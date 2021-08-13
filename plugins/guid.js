/**
 * Tag users with a unique GUID.
 *
 * The `GUID` plugin adds a tracking cookie to the user that will be sent to the
 * beacon-server as cookie.
 *
 * For information on how to include this plugin, see the {@tutorial building} tutorial.
 *
 * ## Beacon Parameters
 *
 * This plugin adds no parameters to the beacon.
 *
 * (It sets the specified cookie)
 * @class PFLO.plugins.GUID
 */
(function() {
	PFLO = window.PFLO || {};
	PFLO.plugins = PFLO.plugins || {};

	if (PFLO.plugins.GUID) {
		return;
	}

	var impl = {
		expires:  604800,
		cookieName: "GUID"
	};

	PFLO.plugins.GUID = {
		/**
		 * Initializes the plugin.
		 *
		 * @param {object} config Configuration
		 * @param {string} config.GUID.cookieName The name of the cookie to be set in the browser session
		 * @param {number} [config.GUID.expires] An expiry time for the cookie in seconds. By default 7 days.
		 *
		 * @returns {@link PFLO.plugins.GUID} The GUID plugin for chaining
		 * @memberof PFLO.plugins.GUID
		 */
		init: function(config) {
			var properties = ["cookieName", "expires"];
			PFLO.utils.pluginConfig(impl, config, "GUID", properties);
			PFLO.info("Initializing plugin GUID " + impl.cookieName, "GUID");

			if (!PFLO.utils.getCookie(impl.cookieName)) {
				PFLO.info("Could not find a cookie for " + impl.cookieName, "GUID");

				var guid = PFLO.utils.generateUUID();

				if (!PFLO.utils.setCookie(impl.cookieName, guid, impl.expires)) {
					PFLO.subscribe("before_beacon", function() {
						PFLO.utils.setCookie(impl.cookieName, guid, impl.expires);
					});
				}

				PFLO.info("Setting GUID Cookie value to: " + guid + " expiring in: " + impl.expires + "s", "GUID");
			}
			else {
				PFLO.info("Found a cookie named: " + impl.cookieName + " value: " + PFLO.utils.getCookie(impl.cookieName), "GUID");
			}
			return this;
		},

		/**
		 * This plugin is always complete (ready to send a beacon)
		 *
		 * @returns {boolean} `true`
		 * @memberof PFLO.plugins.GUID
		 */
		is_complete: function() {
			return true;
		}
	};
}(this));
