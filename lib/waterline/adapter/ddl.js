var _ = require('underscore');
var async = require('async');
var augmentAttributes = require('../augmentAttributes'); // data attribute normalizer

//////////////////////////////////////////////////////////////////////
// DDL
//////////////////////////////////////////////////////////////////////

module.exports = function(adapterDef) {

	var pub = {};

	pub.define = function(collectionName, definition, cb) {

		// Grab attributes from definition
		var attributes = definition.attributes || {};

		// Marshal attributes to a standard format
		definition.attributes = augmentAttributes(attributes,definition);

		// Verify that collection doesn't already exist
		// and then define it and trigger callback
		this.describe(collectionName, function(err, existingAttributes) {
			if(err) return cb(err, attributes);
			else if(existingAttributes) return cb("Trying to define a collection (" + collectionName + ") which already exists.");
			
			adapterDef.define(collectionName, definition, cb);
		});
	};

	pub.describe = function(collectionName, cb) {
		adapterDef.describe(collectionName, cb);
	};
	pub.drop = function(collectionName, cb) {
		adapterDef.drop(collectionName, cb);
	};
	pub.alter = function(collectionName, attributes, cb) {
		var self = this;

		// If the adapterDef defines alter, use that
		if (adapterDef.alter) {
			adapterDef.alter(collectionName, attributes, cb);
		}
		// If the adapterDef defines column manipulation, use it
		else if (adapterDef.addAttribute && adapterDef.removeAttribute) {

			// Update the data belonging to this attribute to reflect the new properties
			// Realistically, this will mainly be about constraints, and primarily uniquness
			// It'd be good if waterline could enforce all constraints at this time,
			// but there's a trade-off with destroying people's data
			// TODO: Figure this out

			// Alter the schema
			self.describe(collectionName, function afterDescribe (err, originalAttributes) {
				if (err) return done(err);

				// Keep track of previously undefined attributes
				// for use when updating the actual data
				var newAttributes = {};

				// Iterate through each attribute in the new definition
				// If the attribute doesn't exist, mark it as a new attribute
				_.each(attributes, function checkAttribute(attribute,attrName) {
					if (!originalAttributes[attrName]) {
						newAttributes[attrName] = attribute;
					}
				});


				// Keep track of attributes which no longer exist in actual data model or which need to be changed
				var deprecatedAttributes = {};
				_.each(originalAttributes,function (attribute,attrName) {
					
					// If an attribute in the data model doesn't exist in the specified attributes
					if (! attributes[attrName]) {

						// Mark it as deprecated
						deprecatedAttributes[attrName] = attribute;
					}

					// TODO: If attribute has changed, recreate the column
					// TODO: this means tracking types, constraints, keys, auto-increment, all that fun stuff
					// if ( !_.isEqual(attributes[attrName],attribute) ) {
						
					// 	// Mark it as deprecated but also add it as a new attribute
					// 	deprecatedAttributes[attrName] = attribute;
					// 	newAttributes[attrName] = attribute;
					// }
				});

				// Add a dummy column (some dbs don't let all columns be removed (cough mysql))
				var dummyColumnName = '_waterline_dummy02492';
				adapterDef.addAttribute(collectionName, dummyColumnName, {type: 'string'}, function (err) {
					if (err) return cb(err);

					// Add and remove attributes using the specified adapterDef
					async.forEachSeries(_.keys(deprecatedAttributes), function (attrName, cb) {
						adapterDef.removeAttribute(collectionName, attrName, cb);
					}, function (err) {
						if (err) return cb(err);
						async.forEachSeries(_.keys(newAttributes), function (attrName, cb) {
							// Marshal attrDef
							var attrDef = newAttributes[attrName];

							adapterDef.addAttribute(collectionName, attrName, attrDef, cb);
						}, function (err) {
							if (err) return cb(err);

							// Remove dummy column
							adapterDef.removeAttribute(collectionName, dummyColumnName, cb);
						});
					});
				});


			});
		}
		// Otherwise don't do anything, it's too dangerous 
		// (dropping and reading the data could cause corruption if the user stops the server midway through)
		else cb();
	};

	return pub;
};