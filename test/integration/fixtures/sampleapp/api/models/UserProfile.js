module.exports = {

	attributes: {
		user: {
			model: 'user',
			via: 'profile'
		},
		zodiac: 'string'
	}

};