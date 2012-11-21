


(function() {
    var winston = require('winston');
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: true
            }),
            new (winston.transports.File)({ 
                filename: sails.config.logging.logFilePath,
                maxsize: 10000000,
                maxFiles: 10,
                level: 'info',
                json: false
            })
        ]
    }); 
    sails.log = new Object
    sails.log.debug = exports.debug = logger.debug
    sails.log.info = exports.info = logger.info
    sails.log.warn = exports.warn = logger.warn
    sails.log.error= exports.error = logger.error
})();
