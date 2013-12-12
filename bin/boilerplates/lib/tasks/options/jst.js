/**
 * Client-side HTML templates are injected using the sources below
 * The ordering of these templates shouldn't matter.
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * By default, Sails uses JST templates and precompiles them into
 * functions for you.  If you want to use jade, handlebars, dust, etc.,
 * edit the relevant sections below.
 */

var templateFilesToInject = [
  'linker/**/*.html'
];

templateFilesToInject = templateFilesToInject.map(function (path) {
  return 'assets/' + path;
});

module.exports = {
  dev: {

    // To use other sorts of templates, specify the regexp below:
    // options: {
    //   templateSettings: {
    //     interpolate: /\{\{(.+?)\}\}/g
    //   }
    // },

    files: {
      '.tmp/public/jst.js': templateFilesToInject
    }
  }
};
