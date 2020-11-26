# tasks/config/uglify.js

This file configures a Grunt task called "uglify".

Its job is to <a target="_blank" href="https://en.wikipedia.org/wiki/Minification_(programming)">minify</a> client-side JavaScript files.  Internally, it uses [UglifyES](https://www.npmjs.com/package/uglifyes).

### Usage

For additional usage documentation, see [`grunt-contrib-uglify`](https://github.com/gruntjs/grunt-contrib-uglify/tree/harmony).

### ES8 and beyond

The default package is capable of minifying JavaScript written using ES6, ES7, and ES8 syntax and features, even without [transpiling](https://sailsjs.com/documentation/concepts/assets/default-tasks#?babel).  However, if you're planning on supporting older browsers that don't support ES6, it's recommended that you still transpile your code (by leaving the default [`babel`](https://sailsjs.com/documentation/anatomy/tasks/config/babel.js) and [`polyfill`](https://sailsjs.com/documentation/anatomy/tasks/register/polyfill.js) tasks in place).

<docmeta name="displayName" value="uglify.js">
