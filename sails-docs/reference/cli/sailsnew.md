# `sails new`

Create a new Sails project.

```usage
sails new your-app-name
```

### Usage:

Most Sails apps should be generated simply by running `sails new your-app-name`, without any additional customization.  But `sails new` also accepts the following options:

  * `--no-frontend`: useful when generating a new Sails app that will not be used to serve any front-end assets.  Disables the generation of the `assets/` folder, `tasks/` folder, and related files.
  * `--minimal`: generates an extremely minimal Sails app.  This disables the same things as `--no-frontend`, along with i18n, Waterline, Grunt, Lodash, Async, sessions, and views.
  * `--without`: used to generate a Sails app without the specified feature(s). The supported "without" options are: `'lodash'`, `'async'`, `'orm'`, `'sockets'`, `'grunt'`, `'i18n'`, `'session'`, and `'views'`. To disable multiple features at once, you can include the options as a comma-separated list, e.g. `sails new your-app-name --without=grunt,views`.


### Example

To create a project called "test-project" in `code/testProject/`:

```text
$ sails new code/testProject
info: Installing dependencies...
Press CTRL+C to skip.
(but if you do that, you'll need to cd in and run `npm install`)
info: Created a new Sails app `test-project`!
```

To create a Sails project in an existing `myProject/` folder:

```text
$ cd myProject
$ sails new .
info: Installing dependencies...
Press CTRL+C to skip.
(but if you do that, you'll need to cd in and run `npm install`)
info: Created a new Sails app `my-project`!
```
> Creating a new Sails app in an existing folder will only work if the folder is empty.

### Notes:
> + `sails new` is really just a special [generator](https://sailsjs.com/documentation/concepts/extending-sails/Generators) which runs [`sails-generate-new`](http://github.com/balderdashy/sails-generate-new).  In other words, running `sails new foo` is an alias for running `sails generate new foo`, and like any Sails generator, the actual generator module which gets run can be overridden in your global `~/.sailsrc` file.


<docmeta name="displayName" value="sails new">
<docmeta name="pageType" value="command">
