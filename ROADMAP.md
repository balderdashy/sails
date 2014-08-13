# Module Dashboard

The current build status, immediate-term plans, and future goals of this repository.

> ###### Feature Requests
>
> We welcome feature requests as edits to the "Backlog" section below.
>
> Before editing this file, please check out [How To Contribute to ROADMAP.md](https://gist.github.com/mikermcneil/bdad2108f3d9a9a5c5ed)- it's a quick read :)



## Build Status

| Release                                                                                                                 | Install Command                                                | Build Status
|------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | -----------------
| [![NPM version](https://badge.fury.io/js/sails.png)](https://github.com/balderdashy/sails/tree/stable) _(stable)_       | `npm install sails`                                          | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=stable)](https://travis-ci.org/balderdashy/sails) |
| [edge](https://github.com/balderdashy/sails/tree/master)                                                                | `npm install sails@git://github.com/balderdashy/sails.git` | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=master)](https://travis-ci.org/balderdashy/sails) |



## Roadmap

Our short-to-medium-term roadmap items, in order of descending priority:

_(feel free to suggest things)_


 Feature                                                  | Owner                                                                            | Details
 :------------------------------------------------------- | :------------------------------------------------------------------------------- | :------
 Socket.io 1.0                                            | [@mikermcneil](https://github.com/mikermcneil)                                   | upgrade to Socket.io 1.0
 Hook dependency/load order mgmt                          | [@mikermcneil](https://github.com/mikermcneil)                                   | rebase the hook dependency+optional depenency system originally proposed by @ragulka
 Standalone router                                        | [@mikermcneil](https://github.com/mikermcneil)                                   | replace express dependency in `lib/router` with standalone router- either routification or @dougwilson's new project
 Standalone view renderer                                 | [@mikermcneil](https://github.com/mikermcneil)                                   | Use @fishrock123's standalone views module (enables views over sockets)
 Standalone static middleware                             | [@mikermcneil](https://github.com/mikermcneil)                                   | use static middleware directly in `lib/router` (enables static files over sockets)
 Request interpreter: Full stream support                 | [@mikermcneil](https://github.com/mikermcneil)                                   | Use new manufactured req/res streams in lib/hooks/sockets (this adds full streams2 compatibility to our socket.io integration, or more generally for any type of attached server)
 Break out core hooks into separate modules               | [@mikermcneil](https://github.com/mikermcneil)                                   | Makes Sails more composable, and removes most of its dependencies in core. Also allows for easier sharing of responsibility w/ the community, controls issue flow


#### Backlog

The backlog consists of features which are not currently in the immediate-term roadmap above, but are useful.  We would exuberantly accept a pull request implementing any of the items below, so long as it was accompanied with reasonable tests that prove it, and it doesn't break other core functionality.

 Feature                                         | Owner                  | Details
 :---------------------------------------------- | :--------------------- | :------
 Watch+reload controllers, models, etc. w/o re-lifting  | [@jbielick](https://github.com/jbielick) | Reload controllers/models/config/services/etc. without restarting the server. Show a filler page while re-bootstrapping.
 Support for multiple blueprint prefixes         | [@mnaughto](https://github.com/mnaughto) | https://github.com/balderdashy/sails/issues/2031
 SDPY protocol support (on top of http:// and ws://)  | [@mikermcneil](https://github.com/mikermcneil)  | https://github.com/balderdashy/sails/issues/80
 Build an alternative sockets hook which uses Primus | [@alejandroiglesias](https://github.com/alejandroiglesias) | https://github.com/balderdashy/sails/issues/945
 Have a `sails migrate` or `sails create-db` command | [@globegitter](https://github.com/Globegitter) | For production environments it would be nice to have a save command that creates the db automatically for you
