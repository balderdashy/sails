# Policies (Core Hook)

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable
>
> The API is in the process of settling, but has not yet had sufficient real-world testing to be considered stable.  
>
> Backwards-compatibility will be maintained if reasonable.


## Purpose

This hook's responsibilities are:

1. Use `sails.modules` to read policies from the user's app into `self.middleware`.
2. Normalize the policy mapping config (`sails.config.policies`)
3. Listen for `route:typeUnknown` and bind a policy if the route requests it.
4. Listen for `router:before` and when it fires, transform loaded middleware that match the policy mapping config (i.e. controller actions) to arrays of functions, where the original middleware is "protected" by one or more relevant policy middleware.



## FAQ

> No frequently asked questions yet...
>
> If you have a question, please feel free to send a PR adding it to this section (even if you don't have the answer!)

