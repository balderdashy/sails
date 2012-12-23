// Load application's custom middleware
// Case insensitive, uses filename to determine identity
module.exports = require('./buildDictionary.js')(sails.config.appPath + '/middleware', /(.+)\.js$/);