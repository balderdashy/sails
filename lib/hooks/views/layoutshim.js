/**
 * Module dependencies
 */

var	  ejsLayoutEngine	= require('ejs-locals')
	, exphbs			= require('express-handlebars')
	, path				= require('path');


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

			else if (sails.config.views.engine.ext === 'handlebars') {
				return sails.after('hook:http:loaded', function() {
					sails.log.verbose('Overriding handlebars engine with express-handlebars to implement layout support...');
					var hbs = exphbs.create({
						defaultLayout: path.join('..', sails.config.views.layout || ''),
						helpers: sails.config.views.helpers || {},
						partialsDir: path.join('views', sails.config.views.partials || '')
					});

					sails.config.views.engine.fn = hbs.engine;
					cb();
				});
			}

		}
	}

	return cb();
};
