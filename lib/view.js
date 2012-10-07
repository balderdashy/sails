// Enable rigging if specified
var viewMiddleware = [];
if(config.rigging) {
	viewMiddleware.push(config._riggingLib.middleware);
}

// Enable other view middleware for use in sails modules
if(config.viewMiddleware) {
	viewMiddleware.concat(config.viewMiddleware);
}
