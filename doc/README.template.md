* _Copyright (c) 2011, Yahoo! Inc.  All rights reserved._
* _Copyright (c) 2011-2012, Log-Normal Inc.  All rights reserved._
* _Copyright (c) 2012-2017 SOASTA, Inc. All rights reserved._
* _Copyright (c) 2017-2019, Akamai Technologies, Inc. All rights reserved._
 * Copyright (c) 2020-2021, doFlo, Inc.  All rights reserved.
* _Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms._

**pflo javascript based web performance and event signal tracking.**

# Summary

pflo is a JavaScript library that measures the page load time experienced by
real users, commonly called RUM (Real User Measurement).  It has the ability to
send this data back to your server for further analysis.  With pflo, you
find out exactly how fast your users think your site is.

Apart from page load time, pflo measures performance timings, metrics and
characteristics of your user's web browsing experience.  All you have to do is
include it in your web pages and call the `PFLO.init()` method.  Once the
performance data is captured, it will be beaconed to your chosen URL.

pflo is designed to be a performant and flexible library that can be adapted
to your site's needs.  It has an extensive plugin architecture, and works with
both traditional and modern websites (including Single Page Apps).

pflo's goal is to not affect the load time of the page (avoiding the
[Observer Effect](https://en.wikipedia.org/wiki/Observer_effect_(information_technology))).
It can be loaded in an asynchronous way that will not delay the page load even
if `pflo.js` is unavailable.

# Features

* Supports:
     * IE 6+, Edge, all major versions of Firefox, Chrome, Opera, and Safari
     * Desktop and mobile devices
* Captures (all optional):
    * Page characteristics such as the URL and Referrer
    * Overall page load times (via [NavigationTiming](https://www.w3.org/TR/navigation-timing/) if available)
    * DNS, TCP, Request and Response timings (via [NavigationTiming](https://www.w3.org/TR/navigation-timing/))
    * Browser characteristics such as screen size, orientation, memory usage, visibility state
    * DOM characteristics such as the number of nodes, HTML length, number of images, scripts, etc
    * [ResourceTiming](https://www.w3.org/TR/resource-timing-1/) data (to reconstruct the page's Waterfall)
    * Bandwidth
    * Mobile connection data
    * DNS latency
    * JavaScript Errors
    * XMLHttpRequest instrumentation
    * Third-Party analytics providers IDs
    * Single Page App interactions

# Usage

pflo can be included on your page in one of two ways: [synchronously](#synchronously) or [asynchronously](#asynchronously).

The asynchronous method is recommended.

<a name="synchronously"></a>
## The simple synchronous way

```html
<script src="pflo.js"></script>
<script src="plugins/rt.js"></script>
<!-- any other plugins you want to include -->
<script>
  PFLO.init({
    beacon_url: "http://yoursite.com/beacon/"
  });
</script>
```

**Note:** You must include at least one plugin (it doesn't have to be `RT`) or
else the beacon will never fire.

Each plugin has its own configuration as well -- these configuration options
should be included in the `PFLO.init()` call:

```javascript
PFLO.init({
  beacon_url: "http://yoursite.com/beacon/",
  ResourceTiming: {
    enabled: true,
    clearOnBeacon: true
  }
});
```

<a name="asynchronously"></a>
## The faster, more involved, asynchronous way

Loading pflo asynchronously ensures that even if `pflo.js` is
unavailable (or loads slowly), your host page will not be affected.

### 1. Add a plugin to init your code

Create a plugin (or use the sample `zzz-last-plugin.js`) with a call
to `PFLO.init`:

```javascript
PFLO.init({
  config: parameters,
  ...
});
PFLO.t_end = new Date().getTime();
```

You could also include any other code you need.  For example, you could include
a timer to measure when pflo has finished loading (as above).

### 2. Build pflo

The [build process](#documentation) bundles `pflo.js` and all of the plugins
listed in `plugins.json` (in that order).

To build pflo with all of your desired plugins, you would run:

```bash
grunt clean build
```

This creates a deployable pflo in the `build` directory, e.g. `build/pflo-<version>.min.js`.

Install this file on your web server or origin server where your CDN can pick it
up.  Set a far future
[max-age](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
header for it.  This file will never change.

### 3. Asynchronously include the script on your page

There are two methods of asynchronously including pflo on your page: by
adding it to your main document, or via the IFRAME/Preload method.

The former method could block your `onload` event (affecting the measured
performance of your page), so the later method is recommended.

<a name="asynchronously-document"></a>
#### 3.1. Adding it to the main document

Include the following code at the *top* of your HTML document:

```javascript
<script>
(function(d, s) {
  var js = d.createElement(s),
      sc = d.getElementsByTagName(s)[0];

  js.src="http://your-cdn.host.com/path/to/pflo-<version>.js";
  sc.parentNode.insertBefore(js, sc);
}(document, "script"));
</script>
```

Best practices will suggest including all scripts at the bottom of your page.
However, that only applies to scripts that block downloading of other resources.

Including a script this way will not block other resources, however it _will_
block `onload`.

Including the script at the top of your page gives it a good chance of loading
before the rest of your page does, thereby reducing the probability of it
blocking the `onload` event.

If you don't want to block `onload` either, use the following IFRAME/Preload method:

<a name="asynchronously-iframe"></a>
#### 3.2. Adding it via an IFRAME/Preload

The method described in 3.1 will still block `onload` on most browsers.

To avoid blocking `onload`, we can load pflo in an asynchronous IFRAME or via LINK preload (for browsers that support
it). The general process is documented on in
[this blog post](https://calendar.perfplanet.com/2018/a-csp-compliant-non-blocking-script-loader/).

For pflo, the asynchronous loader snippet you'll use is:

```javascript
<script>
%loader_snippet%</script>
```

Minified:

```javascript
<script>%minified_loader_snippet%</script>
```

Change the `pfloUrl` to the location of PageFlo on your server.

The `id` of the script node created by this code MUST be `pflo-if-as` (for IFRAME mode) or `pflo-scr-as` (for
Preload mode) as pflo looks for those ids to determine if it's running within an IFRAME and to determine the
URL of the script.

pflo will still export the `PFLO` object to the parent window if running
inside an IFRAME, so the rest of your code should remain unchanged.

#### 3.3. Identifying when pflo has loaded

If you load pflo asynchronously, there's some uncertainty in when pflo
has completed loading.  To get around this, you can subscribe to the
`onPageFloLoaded` Custom Event on the `document` object:

```javascript
// Modern browsers
if (document.addEventListener) {
  document.addEventListener("onPageFloLoaded", function(e) {
    // e.detail.PFLO is a reference to the PFLO global object
  });
}
// IE 6, 7, 8 we use onPropertyChange and look for propertyName === "onPageFloLoaded"
else if (document.attachEvent) {
  document.attachEvent("onpropertychange", function(e) {
    if (!e) e=event;
    if (e.propertyName === "onPageFloLoaded") {
      // e.detail.PFLO is a reference to the PFLO global object
    }
  });
}
```

Note that this only works on browsers that support the CustomEvent interface,
which is Chrome (including Android), Firefox 6+ (including Android), Opera
(including Android, but not Opera Mini), Safari (including iOS), IE 6+
(but see the code above for the special way to listen for the event on IE6, 7 & 8).

pflo also fires the `onBeforePageFloBeacon` and `onPageFloBeacon`
events just before and during beaconing.

<a name="installation"></a>
# Installation

There are several ways of including PageFlo in your project:

1. PageFlo can be downloaded from the official [PageFlo Github repository](https://github.com/dofloinc/pFlo).

2. NPM: `npm install pflojs`

3. Bower: `bower install pflo`

Once fetched, see [Building PageFlo](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-building.html)
for more details on how to include the plugins you require.

<a name="documentation"></a>
# Documentation

Documentation is in the `docs/` directory.  PageFlo documentation is
written in Markdown and is built via [JSDoc](http://usejsdoc.org/).

You can build the current documentation by running Grunt:

```bash
grunt doc
```

HTML files will be built under `build/docs`.

Open-source PageFlo Documentation is currently published at
[dofloinc.github.io/pFlo/pflojs/0.0.0-development/](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/).

<!-- The team at Akamai works on mPulse PageFlo, which contains a few mPulse-specific plugins and may have additional
changes being tested before being backported to the open-source PageFlo.  mPulse PageFlo usage documentation is
available at [docs.soasta.com/pflo/](https://docs.soasta.com/pflo/) and mPulse PageFlo API documentation
is at [developer.akamai.com/tools/pflo/docs/](https://developer.akamai.com/tools/pflo/docs/). -->

Additional documentation:

- [API Documentation](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/): The `PFLO` API
- [Building PageFlo](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-building.html): How to build pflo with plugins
- [Contributing](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-contributing.html): Contributing to the open-source project
- [Creating Plugins](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-creating-plugins.html): Creating a plugin
- [Methodology](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-methodology.html): How pflo works internally
- [How-Tos](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-howtos.html): Short recipes on how to do a bunch of things with pflo

# Source code

The pflo source code is primarily on GitHub at [github.com/dofloinc/pFlo](https://github.com/dofloinc/pFlo).

Feel free to fork it and [contribute](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-contributing.html) to it.

You can also get a [check out the releases](https://github.com/dofloinc/pFlo/releases)
or download a [tarball](https://github.com/dofloinc/pFlo/archive/master.tar.gz) or
[zip](http://github.com/dofloinc/pFlo/archive/master.zip) of the code.

# Support

We use [GitHub Issues](https://github.com/dofloinc/pFlo/issues) for discussions,
feature requests and bug reports.

<!-- Get in touch at [github.com/dofloinc/pFlo/issues](https://github.com/dofloinc/pFlo/issues). -->

<!-- pflo is supported by the developers at [Akamai](http://akamai.com/), and the
awesome community of open-source developers that use and hack it.  That's you.  Thank you! -->

# Contributions

PageFlo would not be possible without the work of:

* the former [Exceptional Performance](http://developer.yahoo.com/performance/) team at the company once known as
    [Yahoo!](http://www.yahoo.com/), aided by the [Yahoo! Developer Network](http://developer.yahoo.com/),
* the folks at [LogNormal](http://www.lognormal.com/), continued by
* the mPulse team at [SOASTA](https://www.soasta.com/), ongoing by
* the mPulse team at [Akamai](https://www.akamai.com/), and
* many independent contributors whose contributions are cemented in our git history

<!-- To help out, please read our [contributing](https://dofloinc.github.io/pFlo/pflojs/0.0.0-development/tutorial-contributing.html) page. -->
