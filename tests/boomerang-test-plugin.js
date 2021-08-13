//
// This should be the last plugin in pflo.js for test builds.
//
// if PFLO_test.init() was called but PageFlo wasn't on the page yet,
// it leaves a PFLO_test_config variable with the config.  We should call
// it now, which will run PFLO.init().
//
if (PFLO.window && PFLO.window.PFLO_test_config) {
	PFLO.window.PFLO_test.init(PFLO.window.PFLO_test_config);

	try {
		delete PFLO.window.PFLO_test_config;
	}
	catch (e) {
		// nop
	}
}
