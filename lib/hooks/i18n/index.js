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
					cookie: null,
					directory: sails.config.appPath + sails.config.i18n.localesDirectory,
					updateFiles: false,
					extension: '.json'
				}));
				
				// Expose global access to locale strings
				sails.__ = i18n.__;
			});

			// Finally
			cb();
		}

	};
};
