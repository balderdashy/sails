try {
  require('fs').symlinkSync("../../node_modules/sails-mysql", "node_modules/sails-mysql");
} catch (e) {
  if (e.code != 'EEXIST') {
    throw new Error(e);
  }
}
module.exports = {
  connections: {
    mysql: {
      adapter: 'sails-mysql',
      host: 'localhost',
      // port: 27017,
      user: 'root',
      // password: 'password',
      database: 'sailstest'
    }

  },
  models: {
    connection: 'mysql',
    migrate: 'alter'
  }
};
