module.exports = function(sails) {


    /**
     * Module dependencies.
     */

    var _       = require('lodash'),
        util    = require('./util');


    /**
     * Expose Logger
     */

    return Logger;


    /**
     * Logger encapsulates winston, a logging library,
     * to manage logging to different adapters
     */

    function Logger(config) {

        var self = this;

        // Save config in instance and extend w/ defaults
        this.config = config = _.defaults(config || {}, {
            maxSize: 10000000,
            maxFiles: 10,
            json: false,
            colorize: true,
            level: 'info',
            timestamp: false
        });

        var winston = require('winston');

        // Available transports
        var transports = [
            new(winston.transports.Console)({
                level: 'debug',
                colorize: config.colorize,
                timestamp: config.timestamp
            })
        ];

        // If filePath option is set, ALSO write log output to a flat file
        if (!_.isUndefined(config.filePath)) {
            transports.push(
                new(winston.transports.File)({
                filename: config.filePath,
                maxsize: config.maxSize,
                maxFiles: config.maxFiles,
                level: 'verbose',
                json: config.json,
                colorize: config.colorize,
                timestamp: config.timestamp
            }));
        }

        var logLevels = {
            verbose: 5,
            info: 4,
            debug: 3,
            warn: 2,
            error: 1,
            silent: 0
        };

        // if adapter option is set, ALSO write log output to an adapter
        if (!_.isUndefined(config.adapters)) {
            _.each(config.adapters, function(val, transport) {
                if (typeof val.module !== 'undefined') {

                    // The winston module MUST be exported to a variable of same name
                    var module = require(val.module)[transport];

                    // Make sure it was exported correctly
                    if (module) {
                        transports.push(
                            new(module)(val)
                        );
                    }
              }
          });
        }

        // Instantiate winston
        var logger = new(winston.Logger)({
            transports: transports
        });

        // Basic log usage
        var CaptainsLog = log('debug');
        CaptainsLog.log = log('debug');
        CaptainsLog.debug = log('debug');
        CaptainsLog.verbose = log('verbose');
        CaptainsLog.info = log('info');
        CaptainsLog.warn = log('warn');
        CaptainsLog.error = log('error');

        // ASCII art and easter eggs
        CaptainsLog.ship = drawShip(CaptainsLog);

        // Export logger object
        return CaptainsLog;

        // Level-aware log function

        function log(level) {
            return function() {
                // Compose string of all the arguments
                var str = [];
                _.each(arguments, function(arg) {
                    if (typeof arg === 'object') {
                        if (arg instanceof Error) {
                            str.push(arg.stack);
                            return;
                        }

                        str.push(util.inspect(arg));
                        return;
                    }

                    if (typeof arg === 'function') {
                        str.push(arg.valueOf());
                        return;
                    }

                    str.push(arg);
                });

                if (logLevels[level] <= logLevels[self.config.level]) {
                    logger[level](str.join(' '));
                }
            };
        }
    }


    /**

    Draw an ASCII image of a ship
                                      I~
                                      |\
                                     /|.\
                                    / || \
                                  ,'  |'  \
                                .-'.-==|/_--'
                                `--'-------'
    */

    function drawShip(log) {

	      //super smart ship drawing algorithm :)
	      var version_line = '   v'+sails.version;
	      var spaces = 23 - version_line.length;
	      for (var i=0; i < spaces; i++){ version_line += ' '; }

        log = log || console.log;
        return function() {
            log.info('');
            log.info('');
            log.info('   Sails.js           <|');
            log.info(version_line+'|\\');
            log.info('                      /|.\\');
            log.info('                     / || \\');
            log.info('                   ,\'  |\'  \\');
            log.info('                .-\'.-==|/_--\'');
            log.info('                `--\'-------\' ');
            log.info('   __---___--___---___--___---___--___');
            log.info(' ____---___--___---___--___---___--___-__');
            log.info('');
        };

  //         <{
  //        / |\
  //       /  | \
  //      / ( |  \
  //     { ___|___\
  //     _____|____
  //     \__\__ /__/

        // return function() {
        //     log('');
        //     log('');
        //     log('');
        //     log('   Sails.js           <|');
        //     log('   v'+sails.version+'              |\\');
        //     log('                      /|.\\');
        //     log('                     / || \\');
        //     log('                   ,\'  |\'  \\');
        //     log('                .-\'.-==|/_--\'');
        //     log('                `--\'-------\' ');
        //     log('   __---___--___---___--___---___--___');
        //     log(' ____---___--___---___--___---___--___-__');
        //     log('');
        // };

        // return function() {
        //     log('');
        //     log('');
        //     log('');
        //     log('   Sails.js        <|');
        //     log('   v' + sails.version + '           |');
        //     log('                \\\\____//');
        //     log('   __---___--___---___--___---___--___');
        //     log(' ____---___--___---___--___---___--___-__');
        // };
    }

};