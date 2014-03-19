# Blueprints (Core Hook)

## Status

> ##### Stability: [1](http://nodejs.org/api/documentation.html#documentation_stability_index) - Experimental
>
> This feature may change.  Please try it out and provide feedback.
> If it addresses a use-case that is important to you, tell the core team.


## Purpose

This hook's responsibilities are:

1. Use `sails.modules` to read blueprints from the user's app into `self.middleware`.
2. Bind shadow routes to blueprint actions and controller actions.
3. Listen for `route:typeUnknown` on `sails`, interpret route syntax which should match a blueprint action, and bind the appropriate middleware (this happens when the Router is loaded, after all the hooks.)

## Roadmap

##### runtime configurability of blueprints
// (i.e. if req.options.limit is set, it's likely a ceiling, and while overridable,
///  the `?limit=...` param probably shouldn't be allowed to exceed the configured limit in route options / policies)

##### TODO: finish updating this and adding the many other roadmap items relevant to blueprints...


## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
