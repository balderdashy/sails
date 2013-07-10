// Configure installed adapters
// If you define an attribute in your model definition, 
// it will override anything from this global config.
module.exports.adapters = {

  // TEST CONFIGS //
  'default': 'custom',
  
  custom: {
    module: 'sails-disk'
  },
  
  sqlite: {
    module: 'sails-sqlite',
    host: 'sqliteHOST',
    user: 'sqliteUSER'
  },
  
  // TESTS END //
  
  memory: {
    module: 'sails-memory'
  },
  disk: {
    module: 'sails-disk'
  },
  mongo: {
    module: 'sails-mongo',
    host: 'localhost',
    user: 'root'
  },
  redis: {
    module: 'sails-redis',
    host: 'localhost',
    user: 'root'
  },
  riak: {
    module: 'sails-riak',
    host: 'localhost',
    user: 'root'
  },
  cassandra: {
    module: 'sails-cassandra',
    host: 'localhost',
    user: 'root'
  },
  elasticsearch: {
    module: 'sails-elasticsearch',
    host: 'localhost',
    user: 'root'
  },
  couchbase: {
    module: 'sails-couchbase',
    host: 'localhost',
    user: 'root'
  },
  mysql: {
    module: 'sails-mysql',
    host: 'localhost',
    user: 'root'
  },
  postgresql: {
    module: 'sails-postgresql',
    host: 'localhost',
    user: 'root'
  },
  oracle: {
    module: 'sails-oracle',
    host: 'localhost',
    user: 'root'
  },
  db2: {
    module: 'sails-db2',
    host: 'localhost',
    user: 'root'
  }
};