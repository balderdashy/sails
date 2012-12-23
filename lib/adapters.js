// Load application's custom adapters
// Case insensitive, uses filename to determine identity
module.exports = require('./buildDictionary.js')(sails.config.appPath + '/adapters', /(.+Adapter)\.js$/, /Adapter/);