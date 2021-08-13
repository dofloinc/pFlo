PageFlo is split into the main framework (`pflo.js`) and plugins (`plugins/*.js`).

`pflo.js` on its own will not do anything interesting.  To enable performance
measurements of your site, you will want to include several plugins.

## Choosing Plugins

Each plugin lives on its own in the `plugins/` directory.  Plugins are split into
core measurement components, though some depend on each other.

The default set of plugins for a "full" build of PageFlo can be seen in `plugins.json`
in the root directory.  You can modify this file to choose which plugins you want for
measurement.

You can read about each plugin in its documentation.  Here is a basic description
of each plugin:

* {@link PFLO.plugins.Angular} enables support for measuring AngularJS websites
* {@link PFLO.plugins.AutoXHR} tracks `XMLHttpRequest`s and other in-page interactions
* {@link PFLO.plugins.Backbone} enables support for measuring Backbone.js websites
* {@link PFLO.plugins.BW} measures HTTP bandwidth
* {@link PFLO.plugins.CACHE_RELOAD} forces the browser to update its cached copy of pflo
* {@link PFLO.plugins.Clicks} tracks in-page clicks
* {@link PFLO.plugins.CrossDomain} allows cross-domain session tracking
* {@link PFLO.plugins.CT} tests whether a script was cached
* {@link PFLO.plugins.DNS} measures DNS latency
* {@link PFLO.plugins.Ember} enables support for measuring Ember.js websites
* {@link PFLO.plugins.Errors} adds JavaScript error tracking
* {@link PFLO.plugins.GUID} adds a unique ID for each session
* {@link PFLO.plugins.IPv6} measures various IPv6 metrics
* {@link PFLO.plugins.History} enables support for measuring React and other `window.history` websites
* {@link PFLO.plugins.Memory} captures browser memory metrics
* {@link PFLO.plugins.Mobile} captures mobile connection type
* {@link PFLO.plugins.NavigationTiming} captures NavigationTiming data
* {@link PFLO.plugins.ResourceTiming} captures ResoureTiming (waterfall) data
* {@link PFLO.plugins.RT} captures round-trip (load) performance
* {@link PFLO.plugins.SPA} is required by any of the SPA plugins
* {@link PFLO.plugins.TPAnalytics} adds third-party analytics IDs to the beacon

There are also a few utility plugins:

* `plugins/compression.js` adds {@link PFLO.utils.Compression} and is used by some plugins for compressing their data

To monitor basic page load performance for a traditional website, we would recommend:
* {@link PFLO.plugins.RT}
* {@link PFLO.plugins.NavigationTiming} captures NavigationTiming data

To monitor a Single Page App website, we would additionally recommend:
* {@link PFLO.plugins.SPA}
* {@link PFLO.plugins.Angular}, {@link PFLO.plugins.Ember}, {@link PFLO.plugins.Backbone} or
  {@link PFLO.plugins.History}

## Including PageFlo on your site.

pflo can be included on your page in one of two ways: [synchronously](#synchronously) or [asynchronously](#asynchronously).

The asynchronous method is recommended.

After the core JavaScript files are loaded, you will need to call {@link PFLO.init}
to initialize PageFlo and all of its plugins.  See each plugin's documentation
for the available configuration options.

<a name="synchronously"></a>
## The simple synchronous way

Simply include `pflo.js` and any desired plugins as a `<script>` tag.

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

Each plugin has its own configuration as well -- these configuration options
should be included in the `PFLO.init()` call:

```html
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

Create a plugin (or use the sample `zzz-last-plugin.js`) with a call to `PFLO.init`:

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

The build process bundles `pflo.js` and all of the plugins listed in
`plugins.json` (in that order).

To build pflo with all of your desired plugins, you would run:

```bash
grunt clean build
```

This creates a deployable pflo in the `build` directory, e.g.
`build/pflo-<version>.min.js`.

Install this file on your web server or origin server where your CDN can pick it
up.  Set a far future [max-age](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
header for it.  This file will never change.

## The Build Process

Build requires [NodeJS](https://nodejs.org/) to execute [Grunt.js](https://gruntjs.com/)
to build PageFlo.

To install Grunt globally:

```bash
npm install -g grunt-cli
```

You can get a full build of pflo by running the following:

```bash
grunt clean build
```

The main build targets are:

* `clean` cleans the `build/` directory
* `build` builds a new version of PageFlo from scratch
* `lint` runs lint on the project
* `test` runs {@tutorial tests}

A full list of build targets are available in `Gruntfile.js`.

Grunt build options:

* `--build-number` Specifies the minor build number
* `--build-revision` Specifies the revision build number

## Build Numbers

PageFlo follows [SemVer](http://semver.org/):

    major.minor.revision

For each build of PageFlo, the major build version is specified in `package.json` as
`releaseVersion`.

The minor version defaults to 0.  Each build can then specify its `--build-number` to
change the minor version.

The revision defaults to 0.  Each build can then specify its `--build-revision`
to change the revision.
