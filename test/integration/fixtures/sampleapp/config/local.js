module.exports = {
  log: {
    level: 'silent'
  },
  views: {
    locals: {
      foo: '!bar!'
    }
  },
  models: {
    migrate: 'alter',
    schema: true
  },
  globals: false
};
