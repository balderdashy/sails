// Load application's controllers
// Case insensitive, uses filename to determine identity
module.exports = require('./buildDictionary.js')(sails.config.appPath + '/controllers', /(.+)\.js$/, /Controller/);