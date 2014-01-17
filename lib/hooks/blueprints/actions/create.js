/**
 * Create
 * (blueprint action)
 * 
 */
module.exports = function genericCreate (req, res) {

	// Get access to `sails` (globals might be disabled) and look up the model.
	var sails = req._sails;
	var Model = sails.models[req.options.model];
	
	// If no model exists for this controller, it's a 404.
	if ( !Model ) return res.notFound();

	

	// The name of the parameter to use for JSONP callbacks
	var JSONP_CALLBACK_PARAM = 'callback';

	// if req.transport is falsy or doesn't contain the phrase "socket"
	// and JSONP is enabled for this action, we'll say we're "isJSONPCompatible"
	var isJSONPCompatible = req.options.jsonp && ! ( req.transport && req.transport.match(/socket/i) );
	

	// Create data object (monolithic combination of all parameters)
	// Omit the JSONP callback parameter (if this is isJSONPCompatible)
	// and params whose values are `undefined`
	var data = req.params.all();
	if (isJSONPCompatible) { data = sails.util.omit(data, JSONP_CALLBACK_PARAM); }




	// Create new instance of model using data from params
	Model.create(data).exec(function created (err, newInstance) {
		
		// TODO: differentiate between waterline-originated validation errors
		//			and serious underlying issues
		// TODO: Respond with badRequest if an error is encountered, w/ validation info
		if (err) return res.serverError(err);

		// // If 'silent' is set, don't use the built-in pubsub
		// if (!req.options.silent) {
		// 	// TODO: enable pubsub in blueprints again when new syntax if fully fleshed out
		// 	sails.publish(newInstance, { method: 'create', data: newInstance.toJSON });
		// }

		// Set status code (HTTP 201: Created)
		res.status(201);
		
		// Send JSONP-friendly response if it's supported
		if ( req.options.jsonp ) {
			return res.jsonp(newInstance.toJSON());
		}

		// Otherwise, strictly JSON.
		else {
			return res.json(newInstance.toJSON());
		}
	});
};
