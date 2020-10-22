# Using CoffeeScript in a Sails app

**The recommended language for building Node.js+Sails apps is JavaScript.**

But Sails also supports using CoffeeScript to write your custom app code (like [actions](http://www.sailsjs.com/documentation/concepts/actions-and-controllers) and [models](http://www.sailsjs.com/documentation/concepts/core-concepts-table-of-contents/models-and-orm)).  You can enable this support in three steps:

1. Run `npm install coffee-script --save` in your app folder.
2. Add the following line at the top of your app's `app.js` file:
```javascript
require('coffee-script/register');
```
3. Start your app with `node app.js` instead of `sails lift`.

### Using CoffeeScript generators

If you want to use CoffeeScript to write your controllers, models or config files, just follow these steps:
 1. Install the generators for CoffeeScript (optional): <br/>`npm install --save-dev sails-generate-controller-coffee sails-generate-model-coffee`
 2. To generate scaffold code, add `--coffee` when using one of the supported generators from the command-line:
```bash
sails generate api <foo> --coffee
# Generate api/models/Foo.coffee and api/controllers/FooController.coffee
sails generate model <foo> --coffee
# Generate api/models/Foo.coffee
sails generate controller <foo> --coffee
# Generate api/controllers/FooController.coffee
```

<docmeta name="displayName" value="Using CoffeeScript">
