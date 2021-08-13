If you are loading pflo.js separately from your main application bundle, i.e.
from a CDN or a third-party service (such as mPulse), we recommend loading pflo.js
using the CSP-compliant non-blocking script loader pattern.

The methodology, [developed by Philip Tellis](http://www.lognormal.com/blog/2012/12/12/the-script-loader-pattern/)
and others, and further [improved in 2018](https://calendar.perfplanet.com/2018/a-csp-compliant-non-blocking-script-loader/),
ensures PageFlo (or any third-party JavaScript) loads asynchronously
and non-blocking.  This means that the browser will not pause while the JavaScript
is loading, nor will it block the `onload` event.

The PageFlo Loader Snippet is currently around 210 lines of code (with comments), and minifies to around 2500 bytes.

The snippet does the following:

1. It checks whether or not the snippet has already been run or PageFlo has already
    been loaded.  If so, it exits.
2. It adds a `window` `load` event handler, to ensure that PageFlo can measure
    the Page Load time in non-NavigationTiming browsers, even if pflo.js
    loads after the `load` event.
3. For browsers that [support Preload](https://caniuse.com/#feat=link-rel-preload) `<link rel="preload" as="script">`,
    PageFlo will add a `<link>` node to tell the browser to fetch PageFlo.js.
    * Once the Preload has finished, PageFlo adds a regular `<script>` node to the page with the same PageFlo URL,
      which tells the browser to execute PageFlo.
4. For browsers that do not support Preload, or if Preload fails or doesn't trigger within the defined timeframe (default 3 seconds),
    the non-blocking IFRAME loader method is used.
    * A hidden `<iframe>` is injected into the page.
    * The snippet attempts to read the IFRAME's `contentWindow.document`.  If it can't,
      it updates the IFRAME's `src` to add JavaScript that sets the IFRAME's `document.domain`
      to the current page's `document.domain`.  This ensures the anonymous IFRAME
      can communicate with the host page.
    * It writes a function `_l()` to the IFRAME's `document` which will add a
      `<script>` tag that loads pflo.js.
    * It sets the IFRAME's `<body onload="document._l()">` to run the function
      above, so the `<script>` tag is loaded after the IFRAME's `onload` event has fired.
5. For IE 6 and IE 7, which don't support the non-blocking IFRAME loader method (due to problems they have with `about:blank`
    URLs in secure contexts), a dynamic `<script>` node is added to the page.
    * Note this means that in IE 6 and 7, PageFlo could be a SPOF (Single Point of Failure) if the script is delayed,
      potentially delaying the Page Load.

Note: We split the `<body` tag insertion into `<bo` and `dy` to avoid server-side output filters that may replace `<body` tags with their own code.

For proof that the non-blocking script loader pattern does not affect page load,
you can look at this
[test case](http://dev.nicj.net/pflo-audit/test-mpulse-loader-snippet-delayed.html)
that delays JavaScript from loading by 5 seconds or these
[WebPagetest results](https://www.webpagetest.org/result/171221_HD_bb090190517fa8dd101859e8c1f327fe/).

## The Snippet

Here's the snippet:

```javascript
<script>
%loader_snippet%</script>
```

Minified:

```javascript
<script>%minified_loader_snippet%</script>
```

## Delaying the Snippet

You may want to delay loading PageFlo until after the `onload` event.  This would
ensure that no PageFlo code is executed in the critical-path of the page load.

The main downside to doing this is that you are more likely to lose beacons
from some users.  The longer it takes PageFlo to load on the page, the higher
chance that the user will have navigated away, or closed the browser, before
pflo.js is loaded.

Here is a modification of the PageFlo Loader Snippet to delay until after
`onload`:

```javascript
<script>
%delayed_loader_snippet%</script>
```

Minified:

```javascript
<script>%minified_delayed_loader_snippet%</script>
```
