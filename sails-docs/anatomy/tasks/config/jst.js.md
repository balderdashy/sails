# tasks/config/jst.js


This file configures a Grunt task called "jst".

It precompiles HTML templates using Underscore/Lodash notation into functions, creating a `.jst` file.  This can be brought into your HTML via a `<script>` tag in order to expose your templates as `window.JST` for use in your client-side JavaScript.

In other words, this takes HTML files in `assets/templates/` and turns them into tiny little JavaScript functions that return HTML strings when you pass a data dictionary into them.  This approach is called "precompiling", and it can considerably speed up template rendering on the client, and even reduce bandwidth usage and related expenses.)

> Note that, by default, Underscore/Lodash/JST notation is _opposite_ from EJS (`<%=` is `<%-`, and vice versa).
> If this bothers you, it can be easily configured in this file. (See inline comments for details.)

### But I'm not using Lodash/Underscore/JST templates...

No problem!

If you aren't using any kind of precompiled client-side templates, then just ignore this file.

If you are using a front-end framework like [Vue.js](https://vuejs.org), Ember, React, or Angular, see the starter app for examples, or come by https://sailsjs.com/support for assistance.

If you want to use a _completely different_ pre-processor like [Handlebars](http://handlebarsjs.com/) or [Dust](http://www.dustjs.com/), and you want Sails to process your client-side templates automatically as you work, then you're in luck.  In most cases, this is as easy as installing the appropriate Grunt plugin as a dependency of your Sails app, and then configuring it to output the precompiled templates (condensed into a single JavaScript file) to the same path as in this default task.

Here are a couple of popular examples:

+ [grunt-contrib-handlebars](https://www.npmjs.com/package/grunt-contrib-handlebars)
+ [grunt-dust](https://www.npmjs.com/package/grunt-dust)


### Usage

For additional usage documentation, see [`grunt-contrib-jst`](https://www.npmjs.com/package/grunt-contrib-jst).



<docmeta name="displayName" value="jst.js">

