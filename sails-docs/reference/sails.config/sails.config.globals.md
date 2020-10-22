# `sails.config.globals`


Configuration for the [global variables](https://developer.mozilla.org/en-US/docs/Glossary/Global_variable) that Sails exposes by default. The globals configuration in Sails is only for controlling global variables introduced by Sails. The options are conventionally specified in the [`config/globals.js`](https://sailsjs.com/anatomy/config/globals-js) configuration file. 



### Properties

| Property    | Type       | Convention  | Details |
|:-----------|:----------:|:----------|:--------|
| `_` _(underscore)_  | ((ref))<br/>_or_<br/>((boolean))     | `require('lodash')`  | Expose the specified `lodash` as a global variable (`_`).  Or set this to `false` to disable the `_` global altogether.  _(More on that below.)_
| `async`  | ((ref))<br/>_or_<br/>((boolean)) | `require('async')` | Expose the specified `async` as a global variable (`async`).  Or set this to `false` to disable the `async` global altogether. _(More on that below.)_
| `models` | ((boolean)) | `true` | Expose each of your app's models as a global variable (using its "globalId").  For example, a model defined in `api/models/User.js` would have a "globalId" of `User`.   If this is disabled, then you can still access all of your models by identity in the [`sails.models`](https://sailsjs.com/documentation/reference/application#?sailsmodels) dictionary.
| `sails` | ((boolean)) | `true` | Expose the `sails` instance representing your app.  Even if this is disabled, you can still get access to it in your actions via `env.sails`, or in your policies via `req._sails`.
| `services` | ((boolean)) | `true` | Expose each of your app's services as global variables (using their "globalId").  E.g. a service defined in `api/services/NaturalLanguage.js` would have a globalId of `NaturalLanguage` by default.  If this is disabled, you can still access your services via `sails.services.*`.


### Using global Lodash (`_`) and Async libraries

Newly-generated Sails 1.0 apps have Lodash v3.10.1 and Async v2.0.1 installed by default and enabled globally so that you can reference `_` and `async` in your app code without needing to `require()`.  This is effected with the following default configuration in `config/globals.js`:

```
{
  _: require('lodash'),

  async: require('async')
}
```

You can disable access by setting the properties to `false`. Prior to `Sails v1.0` you could set the properties to `true`; this has been deprecated and replaced by the syntax above.

To use your own version of Lodash or Async, you just need to `npm install` the version you want.  For example, to install the latest version of Lodash 4.x.x:

```sh
npm install lodash@^4.x.x --save --save-exact
```

### Using Lodash (`_`) and Async without globals

If you have to disable globals, but would still like to use Lodash and/or Async, you're in luck!  With Node.js and NPM, importing packages is very straightforward.

To use your own version of Lodash or Async without relying on globals, first modify the relevant settings in `config/globals.js`:

```js
// Disable `_` and `async` globals.
_: false,
async: false,
```

Then install your own Lodash:

```sh
npm install lodash --save --save-exact
```

Or Async:

```sh
npm install async --save --save-exact
```


Finally, just like you'd import [any other Node.js module](https://soundcloud.com/marak/marak-the-node-js-rap), include `var _ = require('lodash');` or `var async = require('async')` at the top of any file where you need them.




### Notes

> + As a shortcut to disable _all_ of the above global variables, you can set `sails.config.globals` itself to `false`.  This does the same thing as if you had manually disabled each of the settings above.




<docmeta name="displayName" value="sails.config.globals">
<docmeta name="pageType" value="property">

