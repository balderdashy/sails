config = require('./local.js');

module.exports = {
  "development": {
    "username": "root",
    "password": null,
    "database": "database_dev",
    "host": "127.0.0.1"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1"
  }
};
