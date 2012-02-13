// NOTE:
//
// It's stupid that classic MVC frameworks only provide a validation API
// at the model layer.  API parameters need love too!  Validation should be
// provided at the controller layer.
// 
// It is also arguable that the view layer should contain validation for the 
// data coming back over from the controller.
// 
// However, since most everything is likely to come back as AJAX or over 
// socket.io anyway, we'll leave that out.
//

exports.index = function (req, res, next ) {		
	res.render('node/index', {
		title: 'Manage Content | crud.io',
		selected: 'node'
	});
}

exports.create = function (req, res, next ){
	var valid = 
	validateVerb(res,req.method,["PUT"]) &&
	validateType(res,req.query.type);
	
	if (!valid) return;
	Node.build(req.query).save().success(
	
	function successCallback(savedModel) {
		console.log("Model saved to DB.",savedModel);
		res.json(success({
			insertId: savedModel.id
		}));
	}).error(
	
	function errorCallback(response) {
		console.log("Error.  Could not save model to DB.",response);
		res.json(error(response));
	});
}

exports.read = function (req, res, next ){
	var id = req.param('id'), valid = 
	validateId(res,id) &&
	validateVerb(res,req.method,["GET"]);
	
	return valid && res.json(success({
		test: true
	}));
}

exports.update = function (req, res, next ){
	var id = req.param('id'), valid = 
	validateId(res,id) &&
	validateVerb(res,req.method,["POST"]);
	
	valid && res.json(success({
		params: req.params
	}));
}

exports.remove = function (req, res, next ){
	var id = req.param('id'), valid = 
	validateId(res,id) &&
	validateVerb(res,req.method,["DELETE"]);

	
	valid && res.json(success({
		params: req.params
	}));
}







/**
 * Returns true if valid
 * if invalid, returns false and sends a JSON error response
 */
function validateId(res,id) {
	if ( !id ){
		res.json(error("No node id specified."));
		return false;
	}
	else if ( !validId(id) ) {
		res.json(error("'"+id+"' is not a valid node id."));
		return false;
	}
	else {
		return true;
	}
}

/**
 * Returns true if valid
 * if invalid, returns false and sends a JSON error response
 */
function validateVerb(res,verb,okVerbs) {
	// TODO: remove haxx
	return true;
	
	if (!_.contains(okVerbs,verb)) {
		res.json(error({
			message: "Cannot "+verb+" this request.",
			acceptedHTTPMethods: okVerbs
		}));
		return false;
	}
	else {
		return true;
	}
	
}


/**
 * Returns true if valid
 * if invalid, returns false and sends a JSON error response
 */
function validateType(res,type) {
	var validTypes = [
		'html',
		'text'
	];
	
	if ( !type ){
		res.json(error("No content type specified."));
		return false;
	}
	else if ( !_.contains(validTypes,type) ) {
		res.json(error({
			message:"'"+type+"' is not a valid type.",
			validTypes: validTypes
		}));
		return false;
	}
	else {
		return true;
	}
}

/**
 * Returns true if valid
 * if invalid, returns false and sends a JSON error response
 */
function validId(id) {
	return id && (!_.isNaN(+id));
}

function success (response) {
	return _.extend({
		success: true
	}, response);
}

function error (response) {
	return {
		success: false,
		error: (_.isString(response)) ? {
			message: response
		} : response
	};
}