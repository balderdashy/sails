// Load application's models
// Case insensitive, uses filename to determine identity
module.exports = require('./buildDictionary.js')(sails.config.appPath + '/models', /(.+)\.js$/);