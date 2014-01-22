/**
 * Module dependencies
 */
var express		= require('express');

// TODO extrapolate to sails-stringfile
var logDeprecationNotice = require('../../deprecated').logDeprecationNotice;
var logLinks = require('../../deprecated').logLinks;
var LINKS = require('../../links');

module.exports = function (sails) {

	/**
	 * This will just create a copy of the Connect bodyParser, but use Sails.log
	 * instead of console.warn to avoid spitting unexpected output to the console.
	 * 
	 * @param  {Object} options
	 * @return {Middleware}
	 */
	return function multipart (options) {

		if (! sails.config.express.silenceMultipartWarning && process.env.NODE_ENV !== 'test') {
			sails.after('lifted', function () {
				console.log();
				sails.log.warn('Notice:'.bold.yellow,'File uploads are changing, y\'all.'.bold.white);
				sails.log.warn('`connect.multipart()` will be removed in Express 4.0 / Connect 3.0.');
				sails.log.warn('We\'re working on it-- for now, the default multipart body parser is still included.');
				sails.log.warn();
				sails.log.warn('In the mean time, for alternatives and more info, check out:');
				logLinks(['https://gist.github.com/mikermcneil/8249181', 'https://github.com/senchalabs/connect/wiki/Connect-3.0'], sails.log.warn);
				sails.log.warn();
				sails.log.warn('(to silence this warning, change `config/express.js`)');
				console.log();
			});
		}

		// Override console.warn for just a little bit
		var _original = console.warn;
		console.warn = function () {};
		var multipartBodyParser = express.multipart(options);
		console.warn = _original;
		return multipartBodyParser;
	};

};
