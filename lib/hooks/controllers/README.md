# Controllers (Core Hook)

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable
>
> The API is in the process of settling, but has not yet had sufficient real-world testing to be considered stable.  
>
> Backwards-compatibility will be maintained if reasonable.


## Purpose

This hook's responsibilities are:

1. Use `sails.modules` to read controllers from the user's app into `self.middleware`.
2. Listen for `route:typeUnknown` on `sails`, interpret route syntax which should match a controller, and bind the appropriate middleware (this will happen later, when the Router is loaded, after all the hooks.)



## FAQ

+ Why is this a hook and not part of core?
  + Makes it easier to change independently (e.g. you don't like the `*Controller.js` suffix in your controller filenames, or you want to do something else custom)

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
