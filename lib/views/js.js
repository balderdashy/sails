module.exports = function js() {
	if (sails.config.environment === 'development') {

		// Here we link to each known asset script
		var buffer = '';
		_.each(sails.assets.js, function (src) {
			buffer += '<script type="text/javascript" src="{{src}}"></script>';
		});
		return buffer;
	}
	else {

		// In production, link to minified javascript file
		return '<script type="text/javascript" src="{{src}}"></script>';
	}
};
