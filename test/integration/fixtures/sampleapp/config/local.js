module.exports = {
	log: {
		level: 'silent'
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
  },
  globals: false
};
