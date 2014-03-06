module.exports = {
	autoPK: false,
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
		profile: {
			model: 'userprofile'
		}
	}

};