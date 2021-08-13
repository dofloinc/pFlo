By default, PageFlo will wait for the
[window `load` event](https://developer.mozilla.org/en-US/docs/Web/Events/load)
before it sends a beacon, and the Page Load timestamp ({@link PFLO.plugins.RT t_done})
will be measured until the end of that `load` event.

For some cases, you may want to have the Page Load time measure to a timestamp
other than the window `load` event.  For example, your application may load
additional libraries or images at `load`, and you want the Page Load time to
reflect that.

To have PageFlo ignore the window `load` event, you must do two things:

1. Set `autorun` to `false` in {@link PFLO.init}
2. When you want to mark the Page Load time done, you need to call
    {@link PFLO.page_ready}

Example code:

```javascript
PFLO.init({
  beacon_url: "http://yoursite.com/beacon/",
  autorun: false
});

// ...
// at some later point, when the page is loaded:
PFLO.page_ready();
```

PageFlo will send the Page Load beacon when {@link PFLO.page_ready} is called.
