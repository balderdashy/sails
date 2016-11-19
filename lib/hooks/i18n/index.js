module.exports = function(sails) {

    /**
     * Module dependencies.
     */

    var _ = require('@sailshq/lodash'),
        i18n,
        domain = require('domain');


    /**
     * Expose hook definition
     */

    return {

        defaults: {
            // i18n
            i18n: {
                locales: ['en', 'es', 'fr', 'de'],
                defaultLocale: 'en',
                localesDirectory: '/config/locales'
            }
        },

        routes: {

            before: {

                'all /*': function addLocalizationMethod (req, res, next) {

                    i18n.init(req, res, function() {
                        res.locals.i18n = res.i18n = res.__;
                        next();
                    });

                }
            }
        },

        initialize: function(cb) {

            // Hackily include the i18n custom debug levels
            var debugLevel = process.env.DEBUG || '';
            switch (sails.config.log.level) {
                case 'silly':
                case 'verbose':
                case 'debug':
                    debugLevel += ' i18n:debug i18n:warn i18n:error';
                    break;
                case 'info':
                case 'blank':
                case 'warn':
                    debugLevel += ' i18n:warn i18n:error';
                    break;
                case 'error':
                    debugLevel += ' i18n:error';
                    break;
                case 'crit':
                case 'silent':
                    break;
                default:
                    break;
            }
            process.env.DEBUG = debugLevel;

            i18n = require('i18n');
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
