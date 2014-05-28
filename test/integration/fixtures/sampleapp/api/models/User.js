module.exports = {
	autoPK: false,
	schema: true,
	attributes: {
		user_id: {
			type: 'integer',
			primaryKey: true,
			autoIncrement: true
		},
		name: 'string',
		pets: {
			collection: 'pet',
			via: 'owner'
		},
		patients: {
			collection: 'pet',
			via: 'vets'
		},
		profile: {
			model: 'userprofile',
			via: 'user'
		}
	}

};