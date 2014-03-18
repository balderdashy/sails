module.exports = {

	/**
	 * Given a Waterline query, populate the appropriate/specified
	 * association attributes and return it so it can be chained
	 * further ( i.e. so you can .exec() it )
	 *
	 * @param  {Query} query         [waterline query object]
	 * @param  {Object} options
	 * @return {Query}
	 */
	populateAll: function ( query, options ) {

		var DEFAULT_POPULATE_LIMIT = 30;

		return _(options.associations).reduce(function populateEachAssociation (query, association) {

			// Only populate associations if `populate` is set
			//
			// Additionally, allow an object to be specified, where the key is the name
			// of the association attribute, and value is true/false (true to populate,
			// false to not)
			if (options.populate){
				return query.populate(association.alias, { limit: DEFAULT_POPULATE_LIMIT });
			}
			else return query;
		}, query);
	},

	/**
	 * Subscribe deep (associations)
	 *
	 * @param  {[type]} associations [description]
	 * @param  {[type]} record       [description]
	 * @return {[type]}              [description]
	 */
	subscribeDeep: function ( req, record ) {
		_.each(req.options.associations, function (assoc) {

			// Look up identity of associated model
			var ident = assoc[assoc.type];
			var AssociatedModel = sails.models[ident];

			if (req.options.autoWatch) {
				AssociatedModel.watch(req);
			}

			// Subscribe to each associated model instance
			if (assoc.type === 'collection') {
				_.each(record[assoc.alias], function (associatedInstance) {
					AssociatedModel.subscribe(req, associatedInstance);
				});
			}
			else if (assoc.type === 'model') {
				AssociatedModel.subscribe(req, record[assoc.alias]);
			}
		});
	}
};
