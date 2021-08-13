<!DOCTYPE html>
<!--[if IE 8]>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 1.0 Transitional//EN" "http://www.w3.org/TR/html1/DTD/html1-transitional.dtd">
<![endif]-->

<html>
<head>
	<!--[if IE 8]>
	<meta http-equiv="X-UA-Compatible" content="EmulateIE8">
	<![endif]-->
	<title>PageFlo Test <%= fileName %></title>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="../../vendor/mocha/mocha.css" />
	<script type="text/javascript" nonce="pflo-test-1">
	// PFLO API Key is required for some multi-app versions of PageFlo
	window.PFLO_API_key="API_KEY";

	// approx number of lines in the header
	window.HEADER_LINES = 43;
	</script>
	<script src="../../vendor/mocha/mocha.js"></script>
	<script src="../../vendor/assertive-chai/dist/assertive-chai.js"></script>
	<script src="../../vendor/lodash/lodash.js"></script>
	<script src="../../pflo-test-framework.js" type="text/javascript"></script>
	<script type="text/javascript" nonce="pflo-test-2">
		// Clear RT Cookie, preventing navigation related issues with session tests
		window.PFLO_test.clearCookies();

		// Clear localStorage
		window.PFLO_test.clearLocalStorage();

		// Clear sessionStorage
		window.PFLO_test.clearSessionStorage();
	</script>
	</head>
<body>
	<div id="mocha"></div>
	<script type="text/javascript" nonce="pflo-test-3">
	mocha.setup("bdd");
	</script>
	<script src="../../test-templates/common.js" type="text/javascript"></script>
