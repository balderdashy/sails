/**
 * Module dependencies
 */

var util		= require( 'sails-util'),
	express		= require('express');

module.exports = function (sails) {


	// Multipart bodyParser (i.e. express.multipart() ) will be removed
	// in Connect 3 / Express 4.
	// [Why?](https://github.com/senchalabs/connect/wiki/Connect-3.0)
	//
	// The multipart component of this parser will be replaced
	// in a subsequent version of Sails (after v0.10, probably v0.11) with:
	// [file-parser](https://github.com/mikermcneil/file-parser)
	// (or something comparable)
	// 
	// More on overriding the bodyParser:
	// https://gist.github.com/mikermcneil/8249181
	var _temporaryMultipart = require('./multipart')(sails);



	/**
	 * If the original pass of the bodyParser failed to parse anything, rerun it, 
	 * but with an artificial `application/json` content-type header,
	 * forcing it to try and parse the request body as JSON.  This is just in case
	 * the user sent a JSON request body, but forgot to set the appropriate header
	 * (which is pretty much every time, I think.)
	 */
	return function defaultBodyParser (options) {

		// Configure body parser components
		var URLEncodedBodyParser	= express.urlencoded(options);
		var MultipartBodyParser		= _temporaryMultipart(options);
		var JSONBodyParser			= express.json(options);


		// Expose the compount body parser:
		return function _bodyParser (req, res, next) {

			// Optimization: skip bodyParser for GET requests.
			if ( req.method.toLowerCase() === 'get' ) {
				return next();
			}
			// TODO: Optimization: only run bodyParser if this is a known route
			sails.log.verbose('Running request ('+req.method+' ' + req.url + ') through bodyParser...');

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

							// Proceed, whether or not the body was parsed.
							next();
						});	
					});
				});
			});
		};
	};
};

