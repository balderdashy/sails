/**
 * CSS files to inject in order
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * By default, Sails also supports LESS in development and production.
 * To use SASS/SCSS, Stylus, etc., edit the `sails-linker:devStyles` task
 * below for more options.  For this to work, you may need to install new
 * dependencies, e.g. `npm install grunt-contrib-sass`
 */

var cssFilesToInject = [
  'linker/**/*.css'
];


/**
 * Javascript files to inject in order
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * To use client-side CoffeeScript, TypeScript, etc., edit the
 * `sails-linker:devJs` task below for more options.
 */

var jsFilesToInject = [

  // Below, as a demonstration, you'll see the built-in dependencies
  // linked in the proper order order

  // Bring in the socket.io client
  'linker/js/socket.io.js',

  // then beef it up with some convenience logic for talking to Sails.js
  'linker/js/sails.io.js',

  // A simpler boilerplate library for getting you up and running w/ an
  // automatic listener for incoming messages from Socket.io.
  'linker/js/app.js',

  // *->    put other dependencies here   <-*

  // All of the rest of your app scripts imported here
  'linker/**/*.js'
];


// Modify css file injection paths to use
cssFilesToInject = cssFilesToInject.map(function (path) {
  return '.tmp/public/' + path;
});

// Modify js file injection paths to use
jsFilesToInject = jsFilesToInject.map(function (path) {
  return '.tmp/public/' + path;
});

exports.jsFilesToInject = jsFilesToInject;
exports.cssFilesToInject = cssFilesToInject;
