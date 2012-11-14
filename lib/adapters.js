// Build a dictionary of all the app's model adapters
var adapters = {};

var adapterFiles = require('require-all')({ 
		dirname: sails.config.appPath + '/adapters',
		filter: /(.+Adapter)\.js$/
	});

// Go through each adapter and determine its identity
_.each(adapterFiles,function (adapter, filename) {
	// If no 'identity' attribute was provided, 
	// take a guess based on the filename
	if (!adapter.identity) {
		adapter.identity = filename.replace(/Adapter/, "").toLowerCase();
	}
	adapters[adapter.identity] = adapter;
});

// Export adapter dictionary
module.exports = adapters;