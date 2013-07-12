/**
 * Logger configuration
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which 
 * allows for some pretty neat custom transports/adapters for log messages)
 */

module.exports = {
	
	// Valid `level` configs, left-to-right: (from most conservative to most liberal)
	// error, warn, debug, info, verbose
	//
	// (e.g. error displays only error logs, verbose displays all logs)
	log: {
		level: 'info'
	}

};