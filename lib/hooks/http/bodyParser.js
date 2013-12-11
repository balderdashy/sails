module.exports = function (sails) {

	/**
	 * Module dependencies
	 */

	var util		= require( '../../../util'),
		express		= require('express');


	var JSONBodyParser	= express.json();
	var URLEncodedBodyParser	= express.urlencoded();

	// The multipart component of this parser will be replaced
	// in a subsequent version of Sails with:
	// [file-parser](https://github.com/mikermcneil/file-parser).
	var MultipartBodyParser = function (req, res, next) {
		// Consider omitting multipart bodyParser for v0.10.
		// [Why?](https://github.com/senchalabs/connect/wiki/Connect-3.0)
		// return express.multipart();

		return next();
	};



	/**
	 * If the original pass of the bodyParser failed to parse anything, rerun it, 
	 * but with an artificial `application/json` content-type header,
	 * forcing it to try and parse the request body as JSON.  This is just in case
	 * the user sent a JSON request body, but forgot to set the appropriate header
	 * (which is pretty much every time, I think.)
	 */
	return function defaultBodyParser (req, res, next) {
		JSONBodyParser(req, res, function (err) {
			if (err) return next(err);
			URLEncodedBodyParser(req,res, function (err) {
				if (err) return next(err);
				MultipartBodyParser(req, res, function (err) {
					if (err) return next(err);

					// If we were able to parse something at this point
					// (req.body isn't empty) or the content-type is JSON,
					// original body parse must have worked.
					var reqBodyNotEmpty = ! util.isEqual(req.body, {});
					var contentTypeIsJSON = ( backupContentType === 'application/json' );
					if ( contentTypeIsJSON || reqBodyNotEmpty) {
						return next();
					}			

					// Otherwise, set an explicit JSON content-type and try again.
					var backupContentType = req.headers['content-type'];
					req.headers['content-type'] = 'application/json';
					JSONBodyParser(req,res, function (err) {
						
						// Revert content-type
						req.headers['content-type'] = backupContentType;

						// If an error occurred in the retry, it's not actually an error
						// (we can't assume this was intended to be JSON)
						if (err) {
							sails.log.verbose('Attempted to retry bodyParse as JSON.  But no luck.', err);
						}
						next();
					});	
				});
			});
		});
	};
};

