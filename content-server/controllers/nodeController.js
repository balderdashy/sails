exports.index = function (req, res, next ) {		
	res.render('node/index', {
		title: 'Manage Content | crud.io',
		selected: 'node'
	});
}

exports.create = function (req, res, next ){
	var valid = 
		validateVerb(res,req.method,["PUT"]);
	
	return valid && res.json(success({
		insertId: 1
	}));
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
	// TODO: HAXX
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