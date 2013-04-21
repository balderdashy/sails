var _ = require('underscore');
var normalize = require('../normalize.js');

//////////////////////////////////////////////////////////////////////
// Compound Queries
//////////////////////////////////////////////////////////////////////

module.exports = function(adapterDef) {

	var pub = {

		findOrCreate: function(collection, collectionName, criteria, values, cb) {
			var self = this;

			// If no values were specified, use criteria
			if (!values) values = criteria.where ? criteria.where : criteria;
			criteria = normalize.criteria(criteria);

			if(adapterDef.findOrCreate) {
				adapterDef.findOrCreate(collectionName, criteria, values, cb);
			}
			
			// Default behavior
			// WARNING: Not transactional!  (unless your data adapter is)
			else {
				self.find(collectionName, criteria, function(err, result) {
					if(err) return cb(err);
					if(result) return cb(null, result);

					// Call Collection's .create()
					// This gives us the default values and timestamps
					return collection.create(values, cb);
				});
			}

			// TODO: Return model instance Promise object for joins, etc.
		}
	};

	return pub;
};