#Hooks

## Status

> ##### Stability: [2](http://nodejs.org/api/documentation.html#documentation_stability_index) - Unstable

The API is in the process of settling, but has not yet had sufficient real-world testing to be considered stable.  

Backwards-compatibility will be maintained if reasonable.

Most of the non-essential Sails core has been pulled into hooks already.
These hooks may eventually be pulled out into separate modules, or they may continue to live in the main Sails repo (like Connect middleware).

Custom hooks in userland are functional- specifiable as dependencies (`node_modules`) or by tossing them into a folder in your project.  However, this process is not currently well-documented and backwards-compatibility is not guaranteed.  Please check out the source for more details.



## Purpose

Hooks were introduced to Sails as part of major refactor designed to make the framework more modular and testable.
Their primary purpose for now is to pull all but the most minimal functionality of Sails into independent modules.
Eventually, this architecture will allow for built-in hooks to be overridden, and even new hooks to be mixed-in to projects (a proper plugin system).

**Original Proposal:**
https://gist.github.com/mikermcneil/5746660



## Custom Hooks = Plugins?

Sort of! The goal is to make hooks powerful, and simple to work w/ for plugin developers, but also predictable, easy to distribute and install, and documented for end users.

**The hooks API is tentative**, and it is currently going through at least one more set of changes.  We are quickly approaching the point where we can call this feature "Stable", prioritize backwards compatibilty, and limit API changes.

That said, you _can_ write and distribute a custom hook today.  If you're interested in the roadmap for the plugin system, or developing a plugin yourself, consider/check out the following tools at your disposal:

+ [Custom Generators](https://github.com/balderdashy/sails/blob/v0.10/bin/generators/README.md) :: coming in v0.10, useful for extending the Sails command-line interface (Stage 1 - Experimental)
+ [Custom Adapters](https://github.com/balderdashy/sails-docs/blob/0.9/api.adapter-interface.md) :: Since v0.8, useful for adding database support, API integrations, etc. (Stage 2 - Unstable, but approaching Stage 3)
+ [`sails` Core Events](https://gist.github.com/mikermcneil/5898598) :: Since v0.9, the `sails` object is an EventEmitter. (Stage 2 - Unstable, but approaching Stage 3)
+ Custom blueprint middlewares (coming in v0.10: Stage 1 - Experimental)
+ Custom API responses (coming in v0.10: Stage 2 - Unstable)
+ Custom route-level options (since v0.9, but changing in 0.10: Stage 2 - Unstable, but approaching Stage 3)
+ Custom configuration (since v0.7)
+ Custom "shadow routes" (since v0.7, merged in hooks in v0.9)
