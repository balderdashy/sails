/**
* Lumberjack
* A logging library for Sails
*/
(function() {
    var winston = require('winston');
    var useFile = true
    var logging = sails.config.logging
    if (typeof(logging) === 'undefined') {
        useFile = false;
    } else {
        if (typeof(logging.logFilePath) == 'undefined') {
            useFile = false;
        } 
    }
    var transports = [
        new (winston.transports.Console)({
            colorize: true
        })
    ];
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
    var logger = new (winston.Logger)({
        transports: transports
    }); 
    sails.log = new Object
    sails.log.debug = exports.debug = logger.debug
    sails.log.info = exports.info = logger.info
    sails.log.warn = exports.warn = logger.warn
    sails.log.error= exports.error = logger.error
})();
