# Roadmap, Build Status, and Compatibility

The current Travis test output, support matrix, medium-term roadmap, and backlog (including feature requests) for this repository.


## Build Status

| Release                                                                                                                 | Install Command                                                | Build Status
|------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | -----------------
| [![NPM version](https://badge.fury.io/js/sails.png)](https://github.com/balderdashy/sails/tree/stable) _(stable)_  | `npm install sails`                                          | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=stable)](https://travis-ci.org/balderdashy/sails) |
| [edge](https://github.com/balderdashy/sails/tree/master)                                                              | `npm install sails@git://github.com/balderdashy/sails.git` | [![Build Status](https://travis-ci.org/balderdashy/sails.png?branch=master)](https://travis-ci.org/balderdashy/sails) |




## Roadmap


<!--
Note for contributors:

====================================================
*** Owner (column) ***
====================================================
Your github handle and a link to your github profile (this helps us keep track of who suggested what).  The core committers may need to ask you for more details, and we'll want to try our best to keep you informed when relevant stuff changes, or if other interested contributors from the community start work on the requested feature and need help)

For example:
[@particlebanana](https://github.com/particlebanana)

or:
[@mikermcneil](https://github.com/mikermcneil)


====================================================
*** Feature (column) ***
====================================================
The topic -- a short summary of what this feature or change is all about.

• (<=8 words please)

• Features can be very specific (e.g. suggesting a new method) or quite broad (e.g. proposing an optimization or new configuration option)  However, backlog items _should always_ be more than "what if?" questions.  They should suggest an at-least-somewhat-thought-through strategy for implementing the feature.

• It's usually easier/shorter/more expressive to write these feature topics as imperative "commands". e.g. `Emit log events instead of configurable logger` is easier to read than `Can we get rid of the log and instead emit events on Waterline?`  There's plenty of space in in the "Details" section to be more eloquent, explain the "why", and so forth. So don't be afraid to sound rude here; we won't be offended :)

• Finally, there's no need to clarify that these topics are related to Waterline.  Obviously, everything in this repo is related to Waterline, right?

For example:
Add `.unpopulate()` method

or:
Support "populate..until"

or:
Support nested config via env variables

====================================================
*** Details (column) ***
====================================================

A more comprehensive description of the feature (but still relatively concise please.)

Try to answer the question: "Given how it currently works, how _should_ it work?"

• <1 paragraph (it has to fit in a table cell)

• If you need to provide more context/examples (which is likely in many cases), please do so using link(s).  If it's a one-off example or more in-depth examination, linking to a gist is usually ideal.

• If you also sent tests in your PR, please include a link to them here.

• Finally, there's no need to mention this module in your description- it should be obvious since everything in this repo is related to this module :)

e.g.
We could support nested config via env variables by using `__` to represent the `.` (has to be double underscore, single underscore prbly breaks things).  For example: `MYAPP__GENERATOR__OPTIONS__ENGINE` would turn into `generator.options.engine`. (see [tests](https://github.com/mikermcneil/rc/blob/master/test/nested-env-vars.js#L6))



======= misc =======
• Don't worry about spacing too much below-- it'll work regardless.  Just make sure the first two columns are spaced appropriately, since it makes it easier for all of us to see what's going on in here when we're editing this file.  In general, please just look at how other people are doing it and match the conventions.

• If anyone knows how to make the links to github user profiles more concise in markdown, please let me know-- it'd be a lot easier to work w/ this if we could make that first column more narrow

Thanks!
~mike

-->




Our short-to-medium-term roadmap items, in order of descending priority:

_(feel free to suggest things)_

 Feature                                                  | Owner                                                                            | Details     
 :------------------------------------------------------- | :------------------------------------------------------------------------------- | :------
 proper garbage-collection support in core                | [@mikermcneil](https://github.com/mikermcneil)                                   | garbage-collect failed file uploads using the adapter's rm() method (if one exists- otherwise emit a warning)


#### Backlog

The backlog consists of features which are not currently in the immediate-term roadmap above, but are useful.  We would exuberantly accept a pull request implementing any of the items below, so long as it was accompanied with reasonable tests that prove it, and it doesn't break other core functionality.

 Feature                                         | Proposed By            | Details     
 :---------------------------------------------- | :--------------------- | :------
  SDPY protocol support (on top of http:// and ws://)  | @mikermcneil  | https://github.com/balderdashy/sails/issues/80
  Replace Socket.io with Primus | @alejandroiglesias | https://github.com/balderdashy/sails/issues/945
 | Support for multiple blueprint prefixes | @mnaughto | https://github.com/balderdashy/sails/issues/2031
 | Live reloading of backend componants | Many | Reload controllers/models/config/services/etc. without restarting the server. Show a filler page while re-bootstrapping. 

#### Feature Requests

We welcome feature requests as pull requests editing the "Backlog" section above.

Before adding a new item to the backlog or the immediate roadmap, please ensure the feature you're interested in is not already covered by another row in either table.  In addition to _new_ feature requests, please feel welcome to submit any suggested edits to feature requests or roadmap items.

BTW- the most helpful feature requests also include a test which fails in the current implementation, and would pass if the requested feature was implemented :)

Thanks!
~[@mikermcneil](http://twitter.com/mikermcneil)
