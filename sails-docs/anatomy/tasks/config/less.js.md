# tasks/config/less.js


This file configures a Grunt task called "less".

Its job is to compile your LESS files into a CSS stylesheet.

By default, only the `assets/styles/importer.less` file is compiled.  This allows you to control the ordering yourself, i.e. import your dependencies, mixins, variables, resets, etc. before your other more application-specific styles.  This is entirely up to you, and based on the order with which write your `@import`s in your LESS file.

### But I'm not using LESS...

No problem!

If you aren't using _any_ preprocessor for your stylesheets, then just ignore this file.

If you want to use a different pre-processor like [SASS](http://sass-lang.com/) or [Stylus](http://stylus-lang.com/), and you want Sails to process your stylesheets automatically as you work, then you're in luck.  In most cases, this is as easy as installing the appropriate Grunt plugin as a dependency of your Sails app, and then configuring it to output compiled CSS to the same path as in this default task.

Here are a couple of popular examples:

+ [grunt-sass](http://npmjs.com/package/grunt-sass)
+ [grunt-contrib-stylus](https://npmjs.com/package/grunt-contrib-stylus)

### Usage

For additional usage documentation, see [`grunt-contrib-less`](https://npmjs.com/package/grunt-contrib-less).


<docmeta name="displayName" value="less.js">
