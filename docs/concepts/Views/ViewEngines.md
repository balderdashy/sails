# View engines

The default view engine in Sails is [EJS](https://github.com/mde/ejs).

##### Swapping out the view engine

To use a different view engine, you should use npm to install it in your project, then in [`config/views.js`](https://sailsjs.com/documentation/anatomy/config/views.js) set `sails.config.views.extension` to your desired file extension and `sails.config.views.getRenderFn` to a function that returns your view engine's rendering function.

If your view engine is supported by [Consolidate](https://github.com/tj/consolidate.js/blob/master/Readme.md#api), you can use that in `getRenderFn` to easily access the rendering function. First, you'll need to use npm to install `consolidate` into your project, if it is not already present:

```bash
npm install consolidate --save
```

After the install has completed and you have installed your view engine package, you can then set the view configuration.  For example, to use [Swig](https://github.com/paularmstrong/swig) templates you would `npm install swig --save` and then add the following into [`config/views.js`](https://sailsjs.com/documentation/anatomy/config/views.js):

```javascript
extension: 'swig',
getRenderFn: ()=>{
  // Import `consolidate`.
  var cons = require('consolidate');
  // Return the rendering function for Swig.
  return cons.swig;
}
```

The `getRenderFn` allows you to configure your view engine before plugging it into Sails:

```javascript
extension: 'swig',
getRenderFn: ()=>{
  // Import `consolidate`.
  var cons = require('consolidate');
  // Import `swig`.
  var swig = require('swig');
  // Configure `swig`.
  swig.setDefaults({tagControls: ['{?', '?}']});
  // Set the module that Consolidate uses for Swig.
  cons.requires.swig = swig;
  // Return the rendering function for Swig.
  return cons.swig;
}
```

<docmeta name="displayName" value="View engines">
