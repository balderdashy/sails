# Code submission guidelines

There are two types of code contributions we can accept in Sails core:  patches and new features.

**Patches** are small fixes and represent everything from typos to timing issues.  Removing an unused `require()` from the top of a file, or fixing a typo that is crashing the master branch tests on Travis are two great examples of patches.  Major refactoring projects that change whitespace and variable names across multiple files are **not** patches.  Also, keep in mind that even a seemingly trivial change is not a patch if it affects the usage of a documented feature of Sails, or if it adds an undocumented public function.

**New features** are TODOs summarized in the [Sails Roadmap](https://github.com/balderdashy/sails/blob/master/ROADMAP.md) file, with more information in an accompanying pull request.  Anything that is not specifically in the ROADMAP.md file should not be submitted as a new feature.

If in doubt about whether a change you would like to make would be considered a "patch", please open an issue in the [issue tracker](https://github.com/balderdashy/sails/issues/new) or contact someone from our [core team](https://sailsjs.com/about) on Twitter _before_ you begin work on the pull request. Especially do so if you plan to work on something big. Nothing is more frustrating than seeing your hard work go to waste because your vision does not align with planned or ongoing development efforts of the project's maintainers.

#### General rules

- **Javascript supported by [maintained LTS](https://github.com/nodejs/Release/blob/0e0b592273104d1cca9154588092654b932659b1/README.md) only, please**.  For consistency, all imperative code in Sails core, including core hooks and core generators, must be written in JavaScript&mdash;not CoffeeScript, TypeScript, or any other pre-compiled or transpiled language.  Don't get us wrong: we think it's great to use ES6, TypeScript, and/or CoffeeScript syntax in userland code if it boosts your productivity!  But for compatibility and consistency reasons, we cannot merge a pull request unless it is written in maintained LTS-supported JavaScript.
- Do not auto-format code or attempt to fix perceived style problems in existing files in core.
- Keep each pull request narrowly focused on a single goal, and change as few LoC/files as possible.
- Do not submit pull requests that implement new features or enhance existing features unless you are working from a very clearly-defined proposal.  As stated above, nothing is more frustrating than seeing your hard work go unmerged because your vision does not align with a project's maintainers.
- Before beginning work on a feature, be sure to leave a comment telling other contributors that you are working on that feature.  Note that if you do not actively keep other contributors informed about your progress, your silence may be taken as inactivity, and someone else may start their own work on that feature.


#### Contributing to core

Sub-modules within the Sails core are at varying levels of API stability. Bug fixes (patches) are always welcome, but API or behavioral changes cannot be merged without serious planning, as documented in the process for feature proposals above.

Sails has several dependencies referenced in the `package.json` file that are not part of the project proper. Any proposed changes to those dependencies or _their_ dependencies should be sent to their respective projects (e.g. Express, Socket.io, etc.) Please do not send your patch or feature request to the Sails repository&mdash;we cannot accept or fulfill it.  (Though if you reach out via chat, we'll try to help if we can.)


#### Contributing to an adapter

If the adapter is part of core (code base located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests and patches there.

#### Authoring a new adapter

Sails adapters translate Waterline query syntax into the lower-level language of the integrated database, and they take the results from the database and map them to the response expected by Waterline, the Sails framework's ORM.  While creating a new adapter should not be taken lightly, in many cases, writing an adapter is not as hard as it sounds (since you usually end up wrapping around an existing npm package), and it's a great way to get your feet wet with contributing to the ORM hook in Sails and to the Waterline code base.

Before starting work on a new adapter, just make sure and do a thorough search on npm, Google and Github to check that someone else hasn't already started working on the same thing.  Read more about adapters in [Concepts > Extending Sails > Adapters](https://sailsjs.com/documentation/concepts/extending-sails/adapters).


#### Contributing to a hook

If the hook is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If the hook is located in a different repo, please send feature requests, patches, and issues there.  Many core hooks have README.md files with extensive documentation of their purpose, the methods they attach, the events they trigger, and any other relevant information about their implementation.

#### Authoring a new hook

Creating a hook is a great way to accomplish _almost anything_ in Sails core.  Before starting work on a new custom hook, just make sure and do a thorough search on npm, Google, and Github to make sure someone else hasn't already started working on the same thing.  Read more about custom hooks in [Concepts > Extending Sails > Hooks](https://sailsjs.com/documentation/concepts/extending-sails/hooks).


#### Contributing to a generator

If the generator is part of core (code base is located in the Sails repo), please follow the general best practices for contributing to Sails core.  If it is located in a different repo, please send feature requests, patches, and issues there.


#### Authoring a new generator

The custom generator API is not 100% stable yet, but it is settling.  Feel free to start work on a new custom generator, but first make sure and do a thorough search on npm, Google and Github to make sure someone else hasn't already started working on the same thing.  A custom generator is a great way to get your feet wet with contributing to the Sails code base.

<docmeta name="displayName" value="Code submission guidelines">
