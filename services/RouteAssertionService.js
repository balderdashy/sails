// TODO: finish this

/**
 * Route assertion / parameter validation middleware
 * 
 * for use with app.is()
 */
exports.assertions = {
	
	'image': function(req){
		return 0 == req.headers['content-type'].indexOf('image');
	}
	
	
}