// NOTE:
//
// It's stupid that classic MVC frameworks only provide a validation API
// at the model layer.  API parameters need love too!  Validation should be
// provided at the controller layer.
// 
// The view layer should contain validation/marshalling for the 
// data coming back over from the controller, as far as the presentation.
// Excessively long strings should be ellipsized.
// 
// Optionally identify the controller here
// Otherwise name will be based off of filename
// CASE-INSENSITIVE
//exports.id = 'meta'

exports.home = function (req, res, next ) {
	res.render('index', {
		title: 'Sails Framework'
	});
}

exports.error = function (req, res, next ) {
	res.render('500', {
		title: 'Error (500)'
	});
}

exports.notfound = function (req, res, next ) {
	res.render('404', {
		title: 'Not Found (404)'
	});
}
