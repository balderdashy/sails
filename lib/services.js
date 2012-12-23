// Load application's custom services
// Case insensitive, uses filename to determine identity
module.exports = require('./buildDictionary.js')(sails.config.appPath + '/services', /(.+)\.js$/, /Service/);