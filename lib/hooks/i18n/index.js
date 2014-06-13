module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		Hook = require('../../index'),
		i18n = require('i18n'),
		domain = require('domain');


	/**
	 * Expose hook definition
	 */

	return {

		defaults: {
			// i18n
			i18n: {
				locales: ['en', 'es'],
				defaultLocale: 'en',
				localesDirectory: '/config/locales'
			}
		},

		routes: {

			before: {

				'/*': function(req, res, next) {

					i18n.init(req, res, function() {
						res.locals.i18n = res.i18n = res.__;
						next();
					});

				}
			}
		},

		initialize: function(cb) {

			domain.create()

			// Catch
			.on('error', function(err) {
				sails.log.error(err);
			})

			// Try
			.run(function() {
    				i18n.configure(_.defaults(sails.config.i18n, {
    			    //i18n default is null
    				cookie: sails.config.i18n.cookie, 
            directory: sails.config.appPath + sails.config.i18n.localesDirectory,
            //i18n default is true
            updateFiles: sails.config.i18n.updateFiles || false,
            //i18n default is .js
            extension: sails.config.i18n.extension || '.json', 
            //i18n default is \t
            indent: sails.config.i18n.indent, 
            //use http headers
            defaultLocale: sails.config.i18n.defaultLocale
				}));
				
				// Expose global access to locale strings
				sails.__ = i18n.__;
			});

			// Finally
			cb();
		}

	};
};
