
module.exports = function(sails) {



	/**
	 * Overridable function which binds Express middleware
	 * which will run for all HTTP traffic.
	 * 
	 * @param  {ExpressApp} app
	 */
	return sails.config.express.loadMiddleware || function builtInMiddlewareLoader (app) {

		// Get a dictionary of configured middleware
		var wares = require('./middleware')(sails)(app);

		// Use the middleware in the correct order
		if (wares.startRequestTimer) app.use(wares.startRequestTimer);
		if (wares.cookieParser) app.use(wares.cookieParser);
		if (wares.session) app.use(wares.session);
		if (wares.bodyParser) app.use(wares.bodyParser);
		if (wares.handleBodyParserError) app.use(wares.handleBodyParserError);
		if (wares.methodOverride) app.use(wares.methodOverride);
		if (wares.custom) {
			// Legacy config-- the old way to inject custom express middleware
			sails.config.express.customMiddleware(app);
		}
		if (wares.poweredBy) app.use(wares.poweredBy);
		if (wares.router) app.use(wares.router);
		if (wares.www) app.use(wares.www);
		if (wares.favicon) app.use(wares.favicon);
		if (wares[404]) app.use(wares[404]);
		if (wares[500]) app.use(wares[500]);
	};
};