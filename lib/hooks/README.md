#Hooks

## Status

> ##### Stability: [2](https://github.com/balderdashy/sails-docs/blob/master/contributing/stability-index.md) - Stable


## Purpose

Most of the non-essential Sails core has been pulled into hooks already.
These hooks may eventually be pulled out into separate modules, or they may continue to live in the main Sails repo (like Connect middleware).

Hooks were introduced to Sails as part of major refactor designed to make the framework more modular and testable. Their primary purpose was originally to pull all but the most minimal functionality of Sails into independent modules.
Today, most of the non-essential Sails core are hooks. These hooks may eventually be pulled out into separate modules, or they may continue to live in the main Sails repo (like Connect middleware).

This architecture has allowed for built-in hooks to be overridden or disabled, and even for new hooks to be mixed-in to projects.


This gave way to hooks becoming a proper plugin system.  Nowadays, the goal of hooks is to provide an API that is flexible and powerful enough for plugin developers or folks who need to hack Sails core, but also predictable, documented, and easy to install for end users.

See http://sailsjs.com/documentation/concepts/extending-sails/hooks for more information.


> **For historical purposes, here is the original proposal from the v0.9 days:**
> https://gist.github.com/mikermcneil/5746660



## FAQ

> If you have a question that isn't covered here, please feel free to send a PR adding it to this section (even if you don't have the answer!)
