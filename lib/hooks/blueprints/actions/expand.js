/**
 * Expand association
 *
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to look up
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 */

module.exports = function expand (req, res) {

	// Get access to `sails` (globals might be disabled) and look up the model.
	var sails = req._sails;
	var Model = sails.models[req.options.model];
	
	// If no model exists for this controller, it's a 404.
	if ( !Model ) return res.notFound();

	if (!req.options.alias) return res.badRequest();

	var parentId = req.param('parentid');

	Model
		.findOne(id)
		.populate(req.options.alias)
		.exec({
			error: res.serverError,
			success: function found(matchingRecord) {
				if(!matchingRecord) return res.notFound();

				// TODO: enable pubsub in blueprints again when new syntax if fully fleshed out
				// 	req.socket.subscribe(matchingRecord);

				return res.json(matchingRecord);
			}
		});

};



