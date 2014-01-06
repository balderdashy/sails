# Controllers (Core Hook)

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable
>
> The API is in the process of settling, but has not yet had sufficient real-world testing to be considered stable.  
>
> Backwards-compatibility will be maintained if reasonable.


## Purpose

The controller hook's responsibilities are:

1. Use moduleloader to read controllers from the user's app into `self.middleware`.
2. Bind a handler on the Sails object that will be fired when the Sails Router is loaded later.  It will interpret route syntax which should match controller.



## FAQ

+ Why is this a hook and not part of core?
  + Makes it easier to change independently (e.g. you don't like the `*Controller.js` suffix in your controller filenames, or you want to do something else custom)
