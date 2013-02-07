var _ = require('underscore');

/**
 * CaptainsLog
 * A logging library for Sails
 */
module.exports = (function(config) {
    var self = this;

    // Save config in instance and extend w/ defaults
    this.config = config = _.defaults(config || {},{
        maxSize: 10000000,
        maxFiles: 10,
        json: false,
        colorize: true,
        level: 'info'
    });

    var winston = require('winston');

    // Available transports
    var transports = [
    new(winston.transports.Console)({
        level: 'verbose',
        colorize: config.colorize
    })];

    // If filePath option is set, ALSO write log output to a flat file
    if(!_.isUndefined(config.filePath)) {
        transports.push(
        new(winston.transports.File)({
            filename: config.filePath,
            maxsize: config.maxSize,
            maxFiles: config.maxFiles,
            level: 'verbose',
            json: config.json,
            colorize: config.colorize
        }));
    }

    var logLevels = {
        verbose: 5,
        info: 4,
        debug: 3,
        warn: 2,
        error: 1
    };

    // TODO: if adapter option is set, ALSO write log output to an adapter
    // Instantiate winston
    var logger = new(winston.Logger)({
        transports: transports
    });

    // Export logger object
    var CaptainsLog = log('debug');
    CaptainsLog.debug = log('debug');
    CaptainsLog.verbose = log('verbose');
    CaptainsLog.info = log('info');
    CaptainsLog.warn = log('warn');
    CaptainsLog.error = log('error');
    return CaptainsLog;

    function log(level) {
        return function() {
            // Compose string of all the arguments
            var str = "";
            _.each(arguments, function(arg) {
                str += arg + "  ";
            });

            if (logLevels[level] <= logLevels[self.config.level]) {
                logger[level](str);
            }
        };
    }
});