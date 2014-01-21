/**
 * Add a member to an association
 *
 * @param {Integer|String} parentid  - the unique id of the parent record
 * @param {Integer|String} id  - the unique id of the child record to add
 * 
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

module.exports = function add(req, res) {
	
	// Ensure a model can be deduced from the request options.
	var model = req.options.model || req.options.controller;
	var alias = req.options.alias;
	if (!alias || !model) return res.badRequest();

	// Get access to `sails` (globals might be disabled) and look up the model.
	var sails = req._sails;
	var Model = sails.models[model];

	// Locate and validate required parameters
	var parentid = req.param('parentid');
	if (!parentid) {
		return res.badRequest('No parentid provided.');
	}
	var id = req.param('id');
	if (!id) {
		return res.badRequest('No id provided (primary key of the record to be added.)');
	}

	Model
	.findOne(parentid)
	.exec({
		error: res.serverError,
		success: function found(matchingRecord) {
			if (!matchingRecord) return res.notFound();
			if (!matchingRecord[alias]) return res.notFound();

			var associated = matchingRecord[alias];
			associated.add(id);
			matchingRecord.save(function (err) {
				if (err) return res.serverError(err);

				// If we have the pubsub hook, use the model class's publish method
				// to notify all subscribers about the added item
				if (sails.hooks.pubsub) {
					Model.publishAdd(matchingRecord.id, alias, id);
				}

				// 
				// TODO: make this more graceful
				// 
				return res.json(matchingRecord);
			});
		}
	});

};