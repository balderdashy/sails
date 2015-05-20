# Module Dashboard

The current build status, immediate-term plans, and future goals of this repository.

> ###### Feature Requests
>
> We welcome feature requests as edits to the "Backlog" section below.
>
> Before editing this file, please check out [How To Contribute to ROADMAP.md](https://gist.github.com/mikermcneil/bdad2108f3d9a9a5c5ed)- it's a quick read :)
>
> Also take a second to check that your feature request is relevant to Sails core and not one of its dependencies (e.g. Waterline, one of its adapters, one of the core generators, etc.)  If you aren't sure, feel free to send the PR here and someone will make sure it finds its way to the right place.  Note that (for now) core hooks reside in Sails core and so relevant feature requests for a specific hook _do_ belong in this file.



## Build Status

| Release                                                                                                                 | Install Command                                                | Build Status
|------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | -----------------
| [![NPM version](https://badge.fury.io/js/sails.png)](https://github.com/balderdashy/sails/tree/stable) _(stable)_       | `npm install sails`                                          | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=stable)](https://travis-ci.org/balderdashy/sails) |
| [edge](https://github.com/balderdashy/sails/tree/master)                                                                | `npm install sails@git://github.com/balderdashy/sails.git` | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=master)](https://travis-ci.org/balderdashy/sails) |



## Roadmap

Our short-to-medium-term roadmap items, in order of descending priority:


 Feature                                                  | Owner                                                                            | Details
 :------------------------------------------------------- | :------------------------------------------------------------------------------- | :------
 Log key configuration info on lift                       | [@mikermcneil](https://github.com/mikermcneil)     | For example, if `config/local.js` is present, log a message explaining that it will be used.  See also https://github.com/dominictarr/rc/issues/23#issuecomment-33875197
 Lock + unlock app in dev env                             | [@mikermcneil](https://github.com/mikermcneil)     | Capability for a hook to "lock" and/or "unlock" the app (in a development env only).  When "locked" all requests are intercepted by an endpoint which responds with either a page or JSON payload communicating a custom message.  e.g. so the grunt hook can let us know as it syncs.  e.g. `sails.emit('lock')`
 Hook dependency/load order mgmt                          | [@mikermcneil](https://github.com/mikermcneil)                                   | rebase the hook dependency+optional depenency system originally proposed by @ragulka
 Standalone router                                        | [@mikermcneil](https://github.com/mikermcneil)                                   | replace express dependency in `lib/router` with standalone router- either routification or @dougwilson's new project.  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
 Standalone view renderer                                 | [@mikermcneil](https://github.com/mikermcneil)                                   | Use @fishrock123's standalone views module (enables views over sockets).  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
 Standalone static middleware                             | [@mikermcneil](https://github.com/mikermcneil)                                   | use static middleware directly in `lib/router` (enables static files over sockets)  See https://github.com/balderdashy/sails/pull/2351#issuecomment-71855236 for more information.
 Break out core hooks into separate modules               | [@mikermcneil](https://github.com/mikermcneil)                                   | Makes Sails more composable, and removes most of its dependencies in core. Also allows for easier sharing of responsibility w/ the community, controls issue flow.  Started with github.com/balderdashy/sails-hook-sockets



#### Backlog

The backlog consists of features which are not currently in the immediate-term roadmap above, but are useful.  We would exuberantly accept a pull request implementing any of the items below, so long as it was accompanied with reasonable tests that prove it, and it doesn't break other core functionality.

_(feel free to suggest things)_

 Feature                                         | Owner                                              | Details
 :---------------------------------------------- | :------------------------------------------------- | :------
 SPDY/HTTP2 protocol support                     | [@mikermcneil](https://github.com/mikermcneil)     | https://github.com/balderdashy/sails/issues/80
 Have a `sails migrate` or `sails create-db` command | [@globegitter](https://github.com/Globegitter) | For production environments it would be nice to have a save/secure command that creates the db automatically for you
 `sails generate test`  | [@jedd-ahyoung](https://github.com/jedd-ahyoung) | Generate *.test.js following [Sails recommended directory structure](http://sailsjs.org/#!/documentation/concepts/Testing). Example usage: `sails generate test User:Model` creates prepopulated file '/test/unit/models/UserModel.test.js'. See https://github.com/balderdashy/sails/pull/2499 for discussion |
 Wildcard action policies | [@ProLoser](https://github.com/ProLoser)| Instead of only having one global action policy `'*'` it would be nice if we could define policies for a specific action in all controllers: `'*/destroy': ['isOwner']` or something similar.
