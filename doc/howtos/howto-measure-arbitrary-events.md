PageFlo has utility methods to assist in measuring the elapsed time of
any arbitrary event you want to measure.

Note: If you want to measure `XMLHttpRequests`, you should utilize the
{@link PFLO.plugins.AutoXHR AutoXHR} plugin.

There are two ways of measuring events:

1. Call {@link PFLO.requestStart PFLO.requestStart()} to mark the beginning of the event, then
    call `.loaded()` to mark when it is complete
2. Call {@link PFLO.responseEnd PFLO.responseEnd()} with your own timestamps or elapsed time

Both of these methods will trigger a beacon with the Page Group
({@link PFLO.plugins.RT h.pg}) set to the input name.

## Using `PFLO.requestStart`

{@link PFLO.requestStart} can be used to have PageFlo track a complete event.
When {@link PFLO.requestStart} is called, PageFlo will mark the start time.

Once the event is complete, you can call `.loaded()` on the returned object to
mark the end timestamp.

Example:

```javascript
var timer = PFLO.requestStart("my-timer");
setTimeout(function() {
  // will send a beacon with the page group of "my-timer"
  // and an elapsed time of approximately 1 second
  timer.loaded();
}, 1000);
```

## Using `PFLO.responseEnd`

{@link PFLO.responseEnd} can be used to immediately send a beacon based on the
given start time (and optional end time).

Example:

```javascript
var startTime = PFLO.now();

setTimeout(function() {
  // immediately sends a beacon with the page group of "my-timer" and
  // measured from the startTime to now.
  PFLO.responseEnd("my-timer", startTime);

  // you can also specify the end time, i.e. 500ms ago
  PFLO.responseEnd("my-other-timer", startTime, {}, PFLO.now() - 500);
}, 1000);
```
