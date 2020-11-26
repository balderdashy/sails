# tasks/register/polyfill.js

This file configures a Grunt task called "polyfill".

Add a polyfill.js file to the public assets (in dev mode) or minified JavaScript file (in production) to fill in features missing in older browsers, such as `Promise`.  This task is meant to work in conjunction with the [babel task](https://sailsjs.com/documentation/anatomy/tasks/config/babel.js).

##### Development (`polyfill:dev`)

The development version of this task copies the polyfill file to `.tmp/public/polyfill/polyfill.min.js`, and ensures that the file will be included (via the [`linkAssets` task](https://sailsjs.com/documentation/anatomy/tasks/register/linkassets.js)) as a `<script>` tag in any HTML files with the `<!--SCRIPTS-->` template tag.

> By default, the `polyfill:dev` and `babel` tasks are commented out in development Grunt tasks, to make it easier to debug your code in the browser.

##### Production (`polyfill:prod`)

In production, (i.e. when the `NODE_ENV` environment variable is set to `production`), this task adds the contents of the polyfill file to the very top of the concatenated and minified `production.min.js` file.

<docmeta name="displayName" value="polyfill.js">

