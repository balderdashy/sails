/**
 * 
 */
module.exports = function destroy (req, res) {
	// Ensure a model can be deduced from the request options.
	var model = req.options.model || req.options.controller;
	var jsonp = req.options.jsonp;
	if (!model) return res.badRequest();

	// Locate and validate id parameter
	var id = req.param('id');
	if (!id) {
		return res.badRequest('No id provided.');
	}

	// Get access to `sails` (globals might be disabled) and look up the model.
	var sails = req._sails;
	var Model = sails.models[model];
	
	// If no model exists for this controller, it's a 404.
	if ( !Model ) return res.notFound();

	// The name of the parameter to use for JSONP callbacks
	var JSONP_CALLBACK_PARAM = 'callback';

	// if req.transport is falsy or doesn't contain the phrase "socket"
	// and JSONP is enabled for this action, we'll say we're "isJSONPCompatible"
	var isJSONPCompatible = jsonp && ! ( req.transport && req.transport.match(/socket/i) );
	

	

	// Otherwise, find and destroy the model in question
	var Q = Model.findOne(id);
	Q = _(Model.associations).reduce(function (Q, association) {
			return Q.populate(association.alias);
		}, Q);
	Q.exec(function found(err, result) {

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

			// If we have the pubsub hook, use the model class's publish method
			// to notify all subscribers about the added item
			if (sails.hooks.pubsub) {
				Model.publishDestroy(id, !sails.config.blueprints.mirror && req, {previous: result});

				if (req.isSocket) {
					Model.unsubscribe(req, id);
				}

			}
			
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
