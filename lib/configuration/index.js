// configuration/index.js
// --------------------
// Manages app config, including defaults



// Extend defaults with user config
module.exports.build = require('./build');

// Sails default configuration
module.exports.defaults = require('./defaults');


// Normalize legacy and duplicative user config settings
// Validate any required properties, and throw errors if necessary.
// Then issue deprecation warnings and disambiguate any potentially confusing settings.
module.exports.validate = require('./validate');
