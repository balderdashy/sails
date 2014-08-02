module.exports = {
  connections: {
    mongo: {
      adapter: 'sails-mongo',
      host: 'localhost',
      port: 27017,
      // user: 'username',
      // password: 'password',
      database: 'sailstest'
    }

  },
  models: {
    connection: 'mongo'
  }
};
