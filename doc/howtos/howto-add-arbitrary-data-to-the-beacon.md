You may want to add additional parameters to each beacon.  For example, you may
want to tag the beacon with a Page Group or you may want to do A/B testing and
tag the beacon specifying which bucket this beacon is for.  You can achieve all
of this using {@link PFLO.addVar PFLO.addVar()}.

Before you use this method, remember that each plugin adds its own parameters
and you should avoid overwriting these with your own values.  See
{@link PFLO PageFlo} and each {@link PFLO.plugins plugin} for documentation
on what data it adds to the beacon.

## Adding Data to the Beacon

{@link PFLO.addVar} can be used to add any arbitrary data you want to the beacon.

Example usage:

```javascript
PFLO.addVar("ab_test", "a");
```

If you need to set multiple parameters, you can supply an object instead:

```javascript
PFLO.addVar({
  "ab_test": "a"
  "customer_id": 123
});
```

The beacon will include all variables that you add in the URL.  Both keys and
values will be URI encoded.  Your beacon endpoint will need to understand
the data.

```
http://yoursite.com/beacon/?t_done=500&ab_test=1&customer_id=123&...
```

## Removing Data from the Beacon

You can also remove a parameter that you've added (or that a plugin has added)
from the beacon.  To do this, call {@link PFLO.removeVar}:

```javascript
// remove a single parameter
PFLO.removeVar("ab_test");

// remove multiple parameters
PFLO.removeVar("ab_test", "customer_id", "something_else");
```
