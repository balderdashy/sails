# tasks/config/coffee.js

This file configures a Grunt task called "coffee".

By default, this compiles CoffeeScript files located in [`assets/js/`](https://sailsjs.com/anatomy/assets/js/) into JavaScript, then generates new `.js` files in `.tmp/public/js/`.


### But I'm not using CoffeeScript...

No problem!

If you aren't using any kind of pre-processing for your client-side JavaScript, then just ignore this file.

If you want to use a _different_ pre-processor like [TypeScript](https://www.typescriptlang.org/) or [Babel](https://babeljs.io/), and you want Sails to process your client-side JavaScript assets automatically as you work, then you're in luck.  In most cases, this is as easy as installing the appropriate Grunt plugin as a dependency of your Sails app, and then configuring it to output compiled JavaScript to the same path as in this default task.

Here are a couple of popular examples:

+ [grunt-ts](https://www.npmjs.com/package/grunt-ts)
+ [grunt-babel](https://www.npmjs.com/package/grunt-babel)


### Usage

For additional usage documentation, see [`grunt-contrib-coffee`](https://npmjs.com/package/grunt-contrib-coffee).


<docmeta name="displayName" value="coffee.js">
