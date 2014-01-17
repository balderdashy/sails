/**
 * 
 */
module.exports = function destroy (req, res) {
	// Locate and validate id parameter
	var id = req.param('id');
	if (!id) {
		return res.badRequest('No id provided.');
	}

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
	

	

	// Otherwise, find and destroy the model in question
	Model.findOne(id).exec(function found(err, result) {

		// TODO: differentiate between waterline-originated validation errors
		//			and serious underlying issues
		// TODO: Respond with badRequest if an error is encountered, w/ validation info
		if (err) return res.serverError(err);

		if (!result) return res.notFound();

		Model.destroy(id).exec(function destroyed(err) {
			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			// If 'silent' is set, don't use the built-in pubsub
			// if (!req.options.silent) {
				// TODO: enable pubsub in blueprints again when new syntax if fully fleshed out
				// sails.publish(newInstance, { method: 'destroy', data: newInstance.toJSON });
			// }
			
			// Respond with JSON or JSONP
			if ( isJSONPCompatible ) {
				return res.jsonp(result);
			}
			else {
				return res.json(result);
			}
		});
	});
};
