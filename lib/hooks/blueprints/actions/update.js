/**
 * Update Record
 * 
 * An API call to update a model instance with the specified `id`,
 * treating the other unbound parameters as attributes.
 *
 * @param {Integer|String} id  - the unique id of the particular record you'd like to update
 * @param *                    - values to set on the record
 * 
 */
module.exports = function update (req, res) {
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

	// Create data object (monolithic combination of all parameters)
	// Omit the JSONP callback parameter (if this is isJSONPCompatible)
	var data = req.params.all();
	if (isJSONPCompatible) { data = sails.util.omit(data, JSONP_CALLBACK_PARAM); }
	// TODO: and params whose values are `undefined`





	// Otherwise find and update the models in question
	Model.update(id, data).exec(function updated(err, models) {
		// TODO: differentiate between waterline-originated validation errors
		//			and serious underlying issues
		// TODO: Respond with badRequest if an error is encountered, w/ validation info
		if (err) return res.serverError(err);
		if(!models) return res.serverError('No instances returned from update.');
		if (models.length === 0) return res.notFound();

		// Because this should only update a single record and update
		// returns an array, just use the first item
		var model = models[0];

		// If we have the pubsub hook, use the model class's publish method
		// to notify all subscribers about the update
		if (sails.hooks.pubsub) {
			Model.publishUpdate(id, data);

			// If any of the changes were to associations, trigger some more alerts
			_.each(data, function(val, key) {

				// Bail if this attribute isn't in the model's schema
				if (!Model.attributes[key]) return;

				// Get the name of the associated model, if any;
				var reverseModelName = Model.attributes[key].model || Model.attributes[key].collection;
				if (reverseModelName) {
					// Get the associated model class
					var reverseModel = sails.models[reverseModelName];
					// Get the inverse association definition, if any
					reverseAssociation = _.find(reverseModel.associations, {collection: Model.identity}) || _.find(reverseModel.associations, {model: Model.identity});
					if (reverseAssociation) {
						// If this is a many-to-many association, do a publishAdd for the 
						// other side.
						if (reverseAssociation.type == 'collection') {
							reverseModel.publishAdd(id, reverseAssociation.alias, id);
						}

						// Otherwise, do a publishUpdate
						else {
							var data = {};
							data[reverseAssociation.alias] = id;
							reverseModel.publishUpdate(id, data);
						}
					}
				}
			});

		}

		if ( isJSONPCompatible ) {
			return res.jsonp(model.toJSON());
		}
		else {
			return res.json(model.toJSON());
		}
	});
};
