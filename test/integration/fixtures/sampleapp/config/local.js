module.exports = {
	log: {
		level: 'silent'
	},
	sockets: {
    beforeConnect: false
	},
	views: {
    locals: {
      foo: '!bar!'
    }
  },
  blueprints: {
    defaultLimit: 10
  },
  models: {
    migrate: 'alter'
  }
};
