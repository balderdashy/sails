module.exports = {
	
	attributes: {
		name: 'string',
		pets: {
			collection: 'pet',
			via: 'owner'
		}
	}

};