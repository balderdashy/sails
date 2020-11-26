# Sails generate

Generate a code file (or multiple files) in a Sails app.

```usage
sails generate <generator>
```

Sails ships with several _generators_ to help you scaffold new projects, spit out boilerplate code for common files, and automate your development process.

### Core generators

The following _core generators_ are bundled with Sails:

|  Command                        | Details               |
|:--------------------------------|:----------------------|
| sails generate page             | Generate four pages: .ejs, .less, page script, and view action. You must add your .less file to the importer and you must set your route for your new page to work. **Note**: `sails generate page` is intended for use with projects generated with the "Web app" template. You can still use this command if you're not using the web app template, but you'll need to delete the `assets/js/pages/page-name.page.js` file that's been generated, as it relies on dependencies that don't come bundled with an "Empty" Sails app.
| sails generate model            | Generate **api/models/Foo.js**, including attributes with the specified types if provided.<br /> For example, `sails generate model User username isAdmin:boolean` will generate a User model with a `username` string attribute and an `isAdmin` boolean attribute.
| sails generate action           | Generate a standalone [action](https://sailsjs.com/documentation/concepts/actions-and-controllers/generating-actions-and-controllers#?generating-standalone-actions).
| sails generate helper           | Generate a [helper](https://sailsjs.com/documentation/concepts/helpers) at **api/helpers/foo.js**.
| sails generate controller       | Generate **api/controllers/FooController.js**, including actions with the specified names if provided.
| sails generate hook             | Generate a [project hook](https://sailsjs.com/documentation/concepts/extending-sails/hooks/project-hooks) in **api/hooks/foo/**.
| sails generate generator        | Generate a **foo** folder containing the files necessary for building a new generator.
| sails generate response         | Generate a [custom response](https://sailsjs.com/documentation/concepts/extending-sails/custom-responses) at **api/responses/foo.js**
| sails generate adapter          | Generate a **api/adapters/foo/** folder containing the files necessary for building a new adapter.
| sails generate sails.io.js      | Generate a sails.io.js file at the specified location, overwriting the default sails.io.js if applicable.
| _sails generate api_            | _Generate **api/models/Foo.js** and **api/controllers/FooController.js**._
| _sails generate new_            | _Alias for [`sails new`](https://sailsjs.com/documentation/reference/command-line-interface/sails-new)._
| _sails generate etc_            | **Experimental.** Adds the following files to your app:<br/>&bull; .gitignore <br/>&bull; .jshintrc <br/>&bull; .editorconfig <br/>&bull; .npmignore <br/>&bull; .travis.yml <br/>&bull; .appveyor.yml


### Custom generators

[Custom / third party generators](https://sailsjs.com/documentation/concepts/extending-sails/generators) allow you to extend or override the default functionality of `sails generate` (for example, by creating a generator that outputs view files for your favorite [view engine](https://sailsjs.com/documentation/concepts/views/view-engines)).

You can also use custom generators to automate frequent tasks or generate app-specific files.  For example, if you are using React, you might wire up a quick custom generator to allow you to generate [React components](https://facebook.github.io/react/docs/react-component.html) in the appropriate folder in your project (`sails generate react component`).

<docmeta name="displayName" value="sails generate">
<docmeta name="pageType" value="command">

