var _ = require('underscore');

module.exports = function (attributes,config) {

	var newAttributes = _.clone(attributes);

	// If id is not defined, add it
	// TODO: Make this check for ANY primary key
	if(config.defaultPK && !attributes.id) {
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
	// extend definition with updatedAt and createdAt
	var now = {type: 'DATE', 'default': 'NOW'};
	if(config.createdAt && !attributes.createdAt) newAttributes.createdAt = now;
	if(config.updatedAt && !attributes.updatedAt) newAttributes.updatedAt = now;

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