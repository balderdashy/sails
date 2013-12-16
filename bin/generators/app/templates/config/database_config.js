config = require('./local.js');

module.exports = {
  "development": {
    "adapter": 'sails-mongo',
    "username": "username",
    "password": config.dbPassword,
    "database": "database_dev",
    "host": "127.0.0.1",
    "port": 27017
  },
  "test": {
    "adapter": 'sails-mongo',
    "username": "username",
    "password": config.dbPassword,
    "database": "database_test",
    "host": "127.0.0.1",
    "port": 27017
  },
  "production": {
    "adapter": 'sails-mongo',
    "username": "username",
    "password": config.dbPassword,
    "database": "database_production",
    "host": "127.0.0.1",
    "port": 27017
  }
};
