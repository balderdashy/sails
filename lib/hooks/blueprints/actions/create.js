/**
 * Create
 * (blueprint action)
 * 
 */
module.exports = function create (req, res) {

	// Ensure a model can be deduced from the request options.
	var model = req.options.model || req.options.controller;
	var jsonp = req.options.jsonp;
	if (!model) return res.badRequest();


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

		// If we have the pubsub hook, use the model class's publish method
		// to notify all subscribers about the created item
		if (sails.hooks.pubsub) {
			Model.subscribe(req, newInstance);
			Model.publishCreate(newInstance, req);
		}

		// If any of the added values were association attributes, publish add or remove messages.
		_.each(data, function(val, key) {

			var attributes = Model.attributes || {};
			var referencedModel = attributes[key] && (attributes[key].model || attributes[key].collection);
			
			// Bail if this attribute isn't in the model's schema
			if (referencedModel) {
				// Get the associated model class
				var ReferencedModel = sails.models[referencedModel];
				// Get the inverse association definition, if any
				reverseAssociation = _.find(ReferencedModel.associations, {collection: Model.identity}) || _.find(ReferencedModel.associations, {model: Model.identity});

				// If this is a many-to-many association, do a publishAdd for the 
				// other side.
				if (reverseAssociation.type == 'collection') {
					ReferencedModel.publishAdd(val, reverseAssociation.alias, newInstance.id);
				}

				// Otherwise, do a publishUpdate
				else {
					var pubData = {};
					pubData[reverseAssociation.alias] = newInstance.id;
					ReferencedModel.publishUpdate(val, pubData);
				}
			}
		});		

		// Set status code (HTTP 201: Created)
		res.status(201);
		
		// Send JSONP-friendly response if it's supported
		if ( jsonp ) {
			return res.jsonp(newInstance.toJSON());
		}

		// Otherwise, strictly JSON.
		else {
			return res.json(newInstance.toJSON());
		}
	});
};
