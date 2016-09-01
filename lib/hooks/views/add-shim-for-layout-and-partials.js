/**
 * Module dependencies
 */

var path = require('path');


/**
 * Implement EJS layouts and partials (a la Express 2).
 *
 * For further explanation, see:
 *  => http://sailsjs.org/documentation/concepts/views/layouts#?why-do-layouts-only-work-for-ejs
 * ------------------------------------------------------------------------------------------
 *
 * TODO:
 * Extrapolate this functionality to a separate hook
 * to make it easier for folks to extend it with support
 * for other view engines (e.g. hbs).
 *   => See https://github.com/balderdashy/sails/issues/3707 for more info.
 *
 * @param  {Sails}   sails
 */
module.exports = function addShimForLayoutAndPartials (sails) {

  // If layout config is truthy, attempt to use view partials/layout.
  if (sails.config.views.layout) {

    // If `http` hook is not enabled, we can't use partials.
    // (depends on express atm)
    if (sails.config.hooks.http) {

      // Get the view engine name
      var engineName = sails.config.views.engine.name || sails.config.views.engine.ext;

      // Get the extension
      var extension = sails.config.views.engine.ext || sails.config.views.extension;

      // Use ejs-locals for all ejs templates
      if (engineName === 'ejs') {
        var ejsLayoutEngine = require('ejs-locals');
        sails.log.verbose('Overriding ejs engine config with ejslocals to implement layout support...');
        sails.config.views.engine.fn = ejsLayoutEngine;
      }//</ejs>

      // Use express-handlebars for handlebars templates, and set up layout functionality.
      //
      // > **WARNING**
      // > Handlebars layout/partial support is EXPERIMENTAL and may be removed at any time.
      // > It also might stay-- if you would like to see that, please create a proposal in the Sails
      // > repo on GitHub explaining how you see usage working long-term.  Thanks!
      else if (engineName === 'handlebars') {
        var exphbs = require('express-handlebars');
        sails.log.verbose('Overriding handlebars engine with express-handlebars to implement layout support...');
        var hbs = exphbs.create({
          defaultLayout: path.join('..', (sails.config.views.layout + '.' + (extension || 'handlebars')) || ''),
          helpers: sails.config.views.helpers || {},
          partialsDir: path.join('views', sails.config.views.partials || ''),
          extname: extension || 'handlebars'
        });

        sails.config.views.engine.fn = hbs.engine;
      }//</handlebars>

    }//</HTTP hook enabled>
  }//</sails.config.views.layout is truthy>
};
