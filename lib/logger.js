// logger.js
// --------------------
//
// Encapsulates winston, a logging library, to manage logging to different adapters

var _ = require('underscore');

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
        error: 1,
        silent: 0
    };

    // TODO: if adapter option is set, ALSO write log output to an adapter
    // Instantiate winston
    var logger = new(winston.Logger)({
        transports: transports
    });

    // Basic log usage
    var CaptainsLog = log('debug');
    CaptainsLog.debug = log('debug');
    CaptainsLog.verbose = log('verbose');
    CaptainsLog.info = log('info');
    CaptainsLog.warn = log('warn');
    CaptainsLog.error = log('error');

    // ASCII art and easter eggs
    CaptainsLog.ship = drawShip(log('debug'));
    
    // Export logger object
    return CaptainsLog;

    // Level-aware log function
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


// Draw an ASCII image of a ship and waves
function drawShip (log) {
    return function () {
        log('');
        log('');
        log('');
        log('                   <|');
        log('                    |');
        log('                \\\\____//');
        log('--___---___--___---___--___---___');
        log('--___---___--___---___--___---___');
        log('');
    };
}