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
	
	// Lookup for records that match the specified criteria
	var pendingQuery = Model
	.find({
		limit: req.param('limit') || undefined,
		skip: req.param('skip') || req.param('offset') || undefined,
		sort: req.param('sort') || req.param('order') || undefined,
		where: { id: req.param('parentid') }
	})
	.populate(req.options.alias)
	.exec(function found(err, matchingRecords) {

		// TODO: differentiate between waterline-originated validation errors
		//			and serious underlying issues
		// TODO: Respond with badRequest if an error is encountered, w/ validation info
		if (err) return res.serverError(err);

		// No instances found
		if(!matchingRecords) return res.notFound();

		// 	// TODO: enable pubsub in blueprints again when new syntax if fully fleshed out
		// 	req.socket.subscribe(matchingRecords);

		// toJSON() all of the model instances
		matchingRecords = sails.util.invoke(matchingRecords, 'toJSON');

		return res.json(matchingRecords);

	});

		// TODO:
	// 
	// Replace the following helper with the version in sails.util:

	// Attempt to parse JSON
	// If the parse fails, return the error object
	// If JSON is falsey, return null
	// (this is so that it will be ignored if not specified)
	function tryToParseJSON (json) {
		if (!sails.util.isString(json)) return null;
		try {
			return JSON.parse(json);
		}
		catch (e) {
			return e;
		}
	}

	/**
	 * parseWhereParam
	 * 
	 * @param  {Object} allParams [result of calling req.params.all()]
	 * @return {Object}           the WHERE criteria object
	 */
	function parseWhereParam( allParams ) {

		var where = req.param('where');

		// If `where` parameter is a string, try to interpret it as JSON
		if (sails.util.isString(where)) {
			where = tryToParseJSON(where);
		}

		// If `where` has not been specified, but other unbound parameter variables
		// **ARE** specified, build the `where` option using them.
		if (!where) {
			// Prune params which aren't fit to be used as `where` criteria
			// to build a proper where query
			where = sails.util.omit(allParams, ['limit', 'skip', 'sort']);
			where = sails.util.omit(allParams, function (p){ if (sails.util.isUndefined(p)) return true; });
		}

		return where;
	}
};



