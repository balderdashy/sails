var _ = require('underscore');

/**
* Given a set of attributes, normalize them into object notation
* Also add any automatic attributes if configured to do so
* (i.e. default `id` primary key attribute, updatedAt, createdAt, etc.)
*/
module.exports = function (attributes,config) {

	var newAttributes = _.clone(attributes);

	// If id is not defined, add it
	// TODO: Make this check for ANY primary key
	if(config.autoPK && !attributes.id) {
		newAttributes.id = {
			type: 'INTEGER',
			autoIncrement: true,
			'default': 'AUTO_INCREMENT',
			constraints: {
				unique: true,
				primaryKey: true
			}
		};
	}

	// If the adapter config allows it, and they aren't already specified,
	// extend definition with autoUpdatedAt and autoCreatedAt
	var now = {type: 'DATE', 'default': 'NOW'};
	if(config.autoCreatedAt && !attributes.createdAt) newAttributes.createdAt = now;
	if(config.autoUpdatedAt && !attributes.updatedAt) newAttributes.updatedAt = now;

	// Convert string-defined attributes into fully defined objects
	for(var attr in attributes) {
		if(_.isString(attributes[attr])) {
			newAttributes[attr] = {
				type: attributes[attr]
			};
		}
	}
	return newAttributes;
};