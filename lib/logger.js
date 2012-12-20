/**
* CaptainsLog
* A logging library for Sails
*/
module.exports = (function(config) {

    // TODO: Change back to proper winston when jhurliman's pull request is accepted
    // Currently using fork: https://github.com/jhurliman/winston
    // See: https://github.com/flatiron/winston/issues/89
    var winston = require('winston');
    var useFile = true;

    // Parse config
    var logging;
    try {
        logging = sails.config.logging;
    }
    catch (e) {
        logging = undefined;
    }

    if (typeof(logging) === 'undefined') {
        useFile = false;
    } else {
        if (typeof(logging.logFilePath) === 'undefined') {
            useFile = false;
        } 
    }

    // Available transports
    var transports = [
        new (winston.transports.Console)({
            level: config.level,
            colorize: true
        })
    ];

    // If sails.config.logging.useFile option is set, write log output to a flat file
    if (useFile) {
        transports.push(
            new (winston.transports.File)({ 
                filename: logging.logFilePath,
                maxsize: 10000000,
                maxFiles: 10,
                level: config.level,
                json: false
            })
        );
    }

    // Instantiate winston
    var logger = new (winston.Logger)({
        transports: transports
    }); 

    // Build captains log
    var CaptainsLog = logger.debug;
    CaptainsLog.debug = logger.debug;
    CaptainsLog.info = logger.info;
    CaptainsLog.warn = logger.warn;
    CaptainsLog.error = logger.error;
    return CaptainsLog;
});
