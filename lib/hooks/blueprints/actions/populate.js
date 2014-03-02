/**
 * Populate (or "expand") an association
 *
 * @param {Integer|String} parentid  - the unique id of the parent instance
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to look up
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 *
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

module.exports = function expand(req, res) {
	// Ensure a model can be deduced from the request options.
	var model = req.options.model || req.options.controller;
	var alias = req.options.alias;
	if (!alias || !model) return res.badRequest();

	// Get access to `sails` (globals might be disabled) and look up the model.
	var sails = req._sails;
	var Model = sails.models[model];

	var parentId = req.param('parentid');

	Model
		.findOne(parentId)
		.populate(alias, {
			// TODO:
			// where: {},
			// limit: 30,
			// skip: 0
		})
		.exec({
			error: res.serverError,
			success: function found(matchingRecord) {
				if (!matchingRecord) return res.notFound();
				if (!matchingRecord[alias]) return res.notFound();

				return res.json(matchingRecord[alias]);
			}
		});

};