/**
 * Module dependencies
 */
var ejsLayoutEngine = require('ejs-locals');
var exphbs          = require('express-handlebars');
var path            = require('path');
var fs              = require('fs');
var _               = require('lodash');

/**
 * Private
 */
var _getAllHelpers = function(){
  var normalizedPath = path.resolve('views', 'helpers');
  var directory      = fs.readdirSync(normalizedPath);
  var helpers        = {};

  _.forEach(directory, function(file) {
    var helper = require(path.resolve(normalizedPath, file));
    _.assign(helpers, helper);
  });
  return helpers;
};

/**
 * Implement EJS layouts (a la Express 2)
 *
 * TODO:
 * Extrapolate this functionality to a separate hook
 * to make it easier for folks to extend it with support
 * for other view engines (e.g. hbs)
 *
 * @param  {Sails}   sails
 * @param  {Function} cb
 */
module.exports = function layoutshim (sails, cb) {

	// If layout config is set, attempt to use view partials/layout
	if (sails.config.views.layout) {

		// If `http` hook is not enabled, we can't use partials
		// (depends on express atm)
		if (sails.config.hooks.http) {

			// Use ejs-locals for all ejs templates
			if (sails.config.views.engine.ext === 'ejs') {
				// Wait until express is ready, then configure the view engine
				return sails.after('hook:http:loaded', function () {
					sails.log.verbose('Overriding ejs engine config with ejslocals to implement layout support...');
					sails.config.views.engine.fn = ejsLayoutEngine;
					cb();
				});
			}
      // Use Handlebars template engine
			else if (sails.config.views.engine.ext === 'handlebars') {
        // Wait until express is ready, then configure the view engine
				return sails.after('hook:http:loaded', function() {
					sails.log.verbose('Overriding handlebars engine with express-handlebars to implement layout and helpers support...');
          var hbs = exphbs.create({
            extname       : '.hbs',
            layoutsDir    : path.resolve('views','layouts'),
            defaultLayout : path.resolve('views','layouts', 'layout.hbs'),
            partialsDir   : path.resolve('views','partials'),
            helpers       : _getAllHelpers()
					});
          sails.config.views.engine.ext = hbs.extname;
          sails.config.views.engine.fn  = hbs.engine;
					sails.config.views.layout     = hbs.engine;
					cb();
				});
			}

		}
	}

	return cb();
};
