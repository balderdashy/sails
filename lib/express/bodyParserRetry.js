module.exports = function (sails) {

	/**
	 * Module dependencies
	 */

	var util		= require( '../util' );



	 /**
	 * This is a secondary body parser. Designed as a follow-up for the
	 * first Express bodyParser.  If the original pass failed, rerun it, 
	 * but with an `application/json` content-type header.
	 *
	 * Just in case the user forgot to set the header originally
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
		sails.config.express.bodyParser()(req,res, function (err) {
			
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

