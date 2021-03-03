# tasks/config/sails-linker.js

This file configures a Grunt task called "sails-linker".

Automatically inject `<script>` tags and `<link>` tags into the specified 
HTML and/or EJS files.  The specified delimiters (`startTag`
and `endTag`) determine the insertion points.

##### Development (default)

By default, tags will be injected for your app's client-side JavaScript files,
CSS stylesheets, and precompiled client-side HTML templates in the `templates/`
directory (see the `jst` task for more info on that).  In addition, if a LESS
stylesheet exists at `assets/styles/importer.less`, it will be compiled to CSS
and a `<link>` tag will be inserted for it.  Similarly, if any Coffeescript
files exist in `assets/js/`, they will be compiled into JavaScript and injected
as well.

##### Production (`NODE_ENV=production`)

In production, all stylesheets (including all .css files and `assets/styles/importer.less`) are
minified into a single `.css` file (see `tasks/config/cssmin.js` task) and
all client-side scripts (including `.js` and `.coffee` files) are minified
into a single `.js` file (see `tasks/config/uglify.js` task).  Any precompiled,
client-side HTML templates (JST) can also be minified alongside the other
scripts when `sails-linker:prodJs` runs-- but since this could change the
behavior of your front-end code, it is not included by default.

> If you're using JST templates and you'd like them to be included in the
> minified bundle, remove `clientSideTemplates` from the tasklist array in
> `tasks/register/prod.js`, and then modify `tasks/config/uglify.js` to include
> the compiled `jst.js` file from `.tmp/public/` in its `src` array.

### Usage

For additional usage documentation, see [`grunt-sails-linker`](https://www.npmjs.com/package/grunt-sails-linker).

<docmeta name="displayName" value="sails-linker.js">

