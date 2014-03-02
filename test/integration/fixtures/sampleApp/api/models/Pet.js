module.exports = {
	autoPK: false,	
	attributes: {
		pet_id: {
			type: 'integer',
			primaryKey: true,
			autoIncrement: true
		},
		name: 'string',
		owner: {
			model: 'user',
		}
	}

};