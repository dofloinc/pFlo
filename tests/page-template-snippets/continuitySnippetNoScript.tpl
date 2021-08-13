(function() {
	if (window && window.requestAnimationFrame) {
		window.PFLO = window.PFLO || {};
		window.PFLO.fpsLog = [];

		function frame(now) {
			// window.PFLO.fpsLog will get deleted once PageFlo has loaded
			if (window.PFLO.fpsLog) {
				window.PFLO.fpsLog.push(Math.round(now));

				// if we've added more than 30 seconds of data, stop
				if (window.PFLO.fpsLog.length > 30 * 60) {
					return;
				}

				window.requestAnimationFrame(frame);
			}
		}

		window.requestAnimationFrame(frame);
	}
})();
