/**
* Lumberjack
* A logging library for Sails
*/
(function() {
    var winston = require('winston');
    var useFile = true;

    // Parse config
    var logging = sails.config.logging;
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
            colorize: true
        })
    ];

    // If sails.config.logging.useFile option is set, write log output to a flat file
    if (useFile) {
        transports.push(
            new (winston.transports.File)({ 
                filename: sails.config.logging.logFilePath,
                maxsize: 10000000,
                maxFiles: 10,
                level: 'info',
                json: false
            })
        );
    }

    // Instantiate winston
    var logger = new (winston.Logger)({
        transports: transports
    }); 

    // Add logger to global namespace
    sails.log = logger.debug;
    sails.log.debug = exports.debug = logger.debug;
    sails.log.info = exports.info = logger.info;
    sails.log.warn = exports.warn = logger.warn;
    sails.log.error= exports.error = logger.error;
})();
