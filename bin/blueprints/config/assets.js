// Asset rack configuration
module.exports.assets = {

	// Source directories, in order, which will be recursively parsed for css, javascript, and templates
	// and then can be automatically injected in your layout/views
	// ( assets.css(), assets.js() and assets.templateLibrary() )
	sequence: ['./ui/dependencies', './ui/public', './ui/views/templates']
};