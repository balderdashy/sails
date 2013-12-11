module.exports = function (sails) {

	/**
	 * Module dependencies
	 */

	var util		= require( '../../../util'),
		express		= require('express');


	// Build only the relevant JSON bodyParser component here:
	// Why?  Check out: https://github.com/senchalabs/connect/wiki/Connect-3.0
	var JSONParsingMiddleware	= express.json();


	 /**
	 * If the original pass of the bodyParser failed to parse anything, rerun it, 
	 * but with an artificial `application/json` content-type header,
	 * forcing it to try and parse the request body as JSON.  This is just in case
	 * the user sent a JSON request body, but forgot to set the appropriate header
	 * (which is pretty much every time, I think.)
	 */
	

	return function retryBodyParser(req, res, next) {
		var backupContentType = req.headers['content-type'];
		var reqBodyNotEmpty = ! util.isEqual(req.body, {});
		var contentTypeIsJSON = ( backupContentType === 'application/json' );
		
		// If nothing could be parsed using the bodyParser,
		// and content-type wasn't JSON, try JSON.
		// (this allows us to find stuff that's encoded as JSON, 
		// even if the Content-Type header is omitted)				
		if ( contentTypeIsJSON || reqBodyNotEmpty) {
			return next();
		}

		// Otherwise original body parse must have worked
		req.headers['content-type'] = 'application/json';
		JSONParsingMiddleware(req,res, function (err) {
			
			// Revert content-type
			req.headers['content-type'] = backupContentType;

			// If an error occurred in the retry, it's not actually an error
			// (we can't assume this was intended to be JSON)
			if (err) {
				sails.log.verbose('Attempted to retry bodyParse as JSON.  But no luck.', err);
			}
			next();
		});	
	};
};

