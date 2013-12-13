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
            consoleLevel: 'undefined',
            fileLevel: 'undefined'
        });

        if (config.consoleLevel === 'undefined') {
            config.consoleLevel = config.level;
        }
        if (config.fileLevel === 'undefined') {
            config.fileLevel = config.level;
        }

        var winston = require('winston');

        // Available transports
        var transports = [
            new(winston.transports.Console)({
                level: config.consoleLevel,
                colorize: config.colorize
            })
        ];

        // If filePath option is set, ALSO write log output to a flat file
        if (!_.isUndefined(config.filePath)) {
            transports.push(
                new(winston.transports.File)({
                filename: config.filePath,
                maxsize: config.maxSize,
                maxFiles: config.maxFiles,
                level: config.fileLevel,
                json: config.json,
                stripColors: true,
                colorize: false
            }));
        }

        var logLevels = {
            silly: 0,
            verbose: 1,
            info: 2,
            notice: 2,
            debug: 3,
            alert: 4,
            warn: 4,
            warning: 4,
            error: 5,
            crit: 6,
            emerg: 6,
            fail: 6,
            silent: 7
        };

        var logColors = {
            silly: 'cyan',
            verbose: 'cyan',
            info: 'green',
            notice: 'green',
            debug: 'blue',
            alert: 'yellow',
            warn: 'yellow',
            warning: 'yellow',
            error: 'red',
            crit: 'red',
            emerg: 'red',
            fail: 'red',
            silent: 'white'
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
            levels: logLevels,
            colors: logColors,
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
        CaptainsLog.fail = log('fail');

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

                logger.log(level, str.join(' '));
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
        log = log || console.log;
        return function() {
            log.info('');
            log.info('');
            log.info('   Sails.js           <|');
            log.info('   v'+sails.version+'              |\\');
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