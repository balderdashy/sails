/**
 * Add a member to an association
 *
 * @param {Integer|String} id  - the unique id of the parent record
 * @param {Integer|String} childid  - the unique id of the child record to add
 * 
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

module.exports = function add(req, res) {
	
	// Ensure a model and alias can be deduced from the request.
	var Model = actionUtil.parseModel(req);
	var relation = req.options.alias;
	if (!relation) return new Error('Missing required route option, `req.options.alias`.');

	// Locate and validate required parameters
	if (!id) throw new Error('No `id` provided.');
	if (!childid) throw new Error('No `childid` provided (primary key of the record to be added.)');

	Model.findOne(req.param('id')).exec({
		error: res.serverError,
		success: function found(matchingRecord) {
			if (!matchingRecord) return res.notFound();
			if (!matchingRecord[relation]) return res.notFound();

			var associated = matchingRecord[relation];
			
			try {
				associated.add(req.param('childid'));
			}
			catch (err) {
				// Ignore `insert` errors
				if (err && err.type !== 'insert') return res.serverError(err);
			}
			matchingRecord.save(function (err) {

				// Differentiate between waterline-originated validation errors
				// and serious underlying issues. Respond with badRequest if a
				// validation error is encountered, w/ validation info.
				if (err && err.status === 'invalid') return res.badRequest(err);
				
				// Ignore `insert` errors for duplicate adds
				// (but keep in mind, we should not publishAdd if this is the case...)
				var isDuplicateInsertError = (err && err[0] && err[0].type === 'insert');
				if (err && !isDuplicateInsertError) return res.serverError(err);

				// If we have the pubsub hook, use the model class's publish method
				// to notify all subscribers about the added item
				if (!isDuplicateInsertError && req._sails.hooks.pubsub) {

					// Subscribe to the model you're adding to, if this was a socket request
					if (req.isSocket) {
						Model.subscribe(req, matchingRecord);
					}

					// Publish to subscribed sockets
					Model.publishAdd(matchingRecord[Model.primaryKey], relation, req.param('childid'), !req.options.mirror && req);

				}

				Model
				.findOne(req.param('childid'))
				.populate(relation)
				.exec({
					error: res.serverError,
					success: function found(matchingRecord) {
						if (!matchingRecord) return res.serverError();
						if (!matchingRecord[relation]) return res.serverError();
						return res.json(matchingRecord);
					}
				});
			});
		}
	});

};