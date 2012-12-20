/**
* CaptainsLog
* A logging library for Sails
*/
module.exports = (function(config) {

    // TODO: Change back to proper winston when jhurliman's pull request is accepted
    // Currently using fork: https://github.com/jhurliman/winston
    // See: https://github.com/flatiron/winston/issues/89
    var winston = require('winston');

    // Available transports
    var transports = [
        new (winston.transports.Console)({
            level: config.level || 'info',
            colorize: config.colorize || true
        })
    ];

    // If filePath option is set, ALSO write log output to a flat file
    if (!_.isUndefined(config.filePath)) {
        transports.push(
            new (winston.transports.File)({ 
                filename: config.filePath,
                maxsize: config.maxSize || 10000000,
                maxFiles: config.maxFiles || 10,
                level: config.level || 'info',
                json: config.json || false,
                colorize: config.colorize || true
            })
        );
    }

    // TODO: if adapter option is set, ALSO write log output to an adapter

    // Instantiate winston
    var logger = new (winston.Logger)({
        transports: transports
    }); 

    // Export logger object
    var CaptainsLog = log('info');
    CaptainsLog.debug = log('debug');
    CaptainsLog.verbose = log('verbose');
    CaptainsLog.info = log('info');
    CaptainsLog.warn = log('warn');
    CaptainsLog.error = log('error');
    return CaptainsLog;

    function log (level) {
        return _.bind(logger.log,logger,level);
    }
});
