/**
 * Default 404 (not found) handler
 *
 * If no matches are found, Sails will respond using this handler:
 *
 */

module.exports[404] = function pageNotFound (req, res, defaultNotFoundBehavior) {
	
	// If the user-agent wants a JSON response,
	// the views hook is disabled,
	// or the 404 view doesn't exist,
	// send JSON
	if (req.wantsJSON || 
		!sails.config.hooks.views || !res.view ||
		!sails.hooks.views.middleware[404]) {
		return res.json({
			status: 404
		}, 404);
	}

	// Otherwise, serve the `views/404.*` page
	res.view('404');
	
};

