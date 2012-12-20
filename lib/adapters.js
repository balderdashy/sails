// Build a dictionary of all the app's model adapters
module.exports = buildDictionary(__dirname + '/adapters', /(.+Adapter)\.js$/, /Adapter/) || {};