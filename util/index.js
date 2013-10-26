var _ = require('lodash'),
	nodeutil = require('util'),
	safeStringify = require('json-stringify-safe');
_.str = require('underscore.string');



// Extend with node util methods
_.extend(exports, nodeutil);

// Extend util with underscore/lodash
// and underscore.string methods
_.extend(exports, _);






/**
 * Accept things like `FooController` or `FoO`, then transform 
 * and lower-case them to things like `foo`
 * 
 * @api private
 */

exports.normalizeControllerId = function normalizeControllerId (controllerId) {
	if (!_.isString(controllerId)) {
		return null;
	}
	controllerId = controllerId.replace(/(.+)Controller$/i, '$1');
	controllerId = controllerId.toLowerCase();
	return controllerId;
};





/**
 * Accept things like `FooAdapter` or `FoO`, then transform 
 * and lower-case them to things like `foo`
 *
 * Works for adapters, controllers, and services
 * 
 * @api private
 */

exports.normalizeId = function normalizeId (id) {
	if (!_.isString(id)) {
		return null;
	}
	id = id.replace(/(.+)(Controller|Adapter|Service)$/i, '$1');
	id = id.toLowerCase();
	return id;
};



/**
 * defaultsDeep
 *
 * Implement a deep version of `_.defaults`.
 *
 * @api private
 */
exports.defaultsDeep = _.partialRight(_.merge, _.defaults);






/**
 * Normalize an error or array of errors into an array of proper, readable Errors
 *
 * @param {String|Object|Error|Array} errOrErrs
 * @returns {Array[Error]}
 * 
 * @api private
 */

exports.normalizeErrors = function normalizeErrors(errOrErrs) {

	// If `errOrErrs` is not an array already, make it one
	var errorsToDisplay = _.isArray(errOrErrs) ? errOrErrs : [errOrErrs];

	// Ensure that each error is formatted correctly
	return _.map(errorsToDisplay, function (e, i) {
		var displayError;

		// Make error easier to read, and normalize its type
		if (e instanceof Error) {
			displayError = e;
		}
		
		// Create an error ad hoc
		// (but save reference to original)
		else {
			displayError = new Error( nodeutil.inspect(e) );
			displayError.original = e;
		}

		return displayError;
	});
};






/**
 * Detect HTTP verb in an expression like:
 * `get baz`    or     `get /foo/baz`
 * 
 * @api private
 */

exports.detectVerb = function (haystack) {
	var verbExpr = /^(get|post|put|delete|trace|options|connect|patch|head)\s+/i;
	var verbSpecified = _.last(haystack.match(verbExpr) || []) || '';
	verbSpecified = verbSpecified.toLowerCase();
	
	// If a verb was specified, eliminate the verb from the original string
	if (verbSpecified) {
		haystack = haystack.replace(verbExpr,'');
	}

	return {
		verb: verbSpecified,
		original: haystack,
		path: haystack
	};
};







/**
 * Run a method meant for a single object on a single instance OR array.
 * For a list, run the method on each item return the resulting array.
 * For anything else, return it silently.
 * 
 * @api private
 */

exports.pluralize = function pluralize(collection, application) {
	if(_.isArray(collection)) {
		return _.map(collection, application);
	}
	return application(collection);
};






/**
 * Detect if a string is "safe" to eval()
 * 
 * @api private
 */

exports.safeToEval = function(someString) {
	try {
		!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(someString.replace(/"(\\.|[^"\\])*"/g, ''))) && eval('(' + someString + ')');
	} catch(e) {
		return false;
	}
	return true;
};






/**
 * Return whether the specified item is an object, but NOT an array or function
 *
 * TODO:	replace usages of this method with `instanceof` 
 *			and `_.isPlainObject()`
 *
 * @api private
 * 
 * @api private
 */
exports.isDictionary = function isDictionary(thing) {
	return _.isObject(thing) && !_.isArray(thing) && !_.isFunction(thing);
};








/**
 * optional
 * 
 * Wrap a callback function to make it optional
 * 
 * @api private
 */

exports.optional = function wrapOptionalCallback (cb) {
	return function optionalCallback () {
		if (!cb) return;
		var args = Array.prototype.slice.call(arguments);
		return cb.apply(this, args);
	};
};






/**
 * Get the domain out of the origin header--
 * compare it to the host
 * 
 * @api private
 */

exports.isSameOrigin = function isSameOrigin (req) {
	var domain = req.headers.origin.match(/^https?:\/\/([^:]+)(:\d+)?$/)[1];
	return (req.host == domain);
};





/**
 * Return whether the given object is an instance of Error
 * 
 * @api private
 */

exports.isError = function (e) {
	return e instanceof Error;
};





/**
 * Extract the file extension suffix from a filename or path
 * 
 * @api private
 */

exports.fileExtension = function(str) {
	if(str === null) return '';
	var pieces = String(str).split('.');
	return pieces.length > 1 ? _.last(pieces) : '';
};




/**
 * Return the abbreviated ordinal string for a given integer
 * 
 * http://en.wikipedia.org/wiki/Ordinal_number_(linguistics)
 * i.e. prettier rendering of things like: 1st, 2nd, 3rd, 4th
 * 
 * @api private
 */

exports.ordinal = function(integer) {
	if(_.isFinite(+integer) && Math.floor(+integer) === +integer) {
		var lastDigit = +integer % 10;
		var lastTwoDigits = +integer % 100;
		var response = integer + "";

		// Handle n-teen case
		if(lastTwoDigits >= 11 && lastTwoDigits <= 13) {
			return response + "th";
		}

		// Handle general case
		switch(lastDigit) {
		case 1:
			return response + "st";
		case 2:
			return response + "nd";
		case 3:
			return response + "rd";
		default:
			return response + "th";
		}
	}
	throw new Error("sails.util.ordinal() only works on integers!");
};





/**
 * Get the names of a function's arguments
 *
 * @param {Function} func
 * @returns array of argument names, e.g. ['req', 'res']
 * 
 * @api private
 */ 
exports.getParamNames = function(func) {

	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var fnStr = func.toString().replace(STRIP_COMMENTS, '');
	var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
	if (result === null)
		result = [];
	return result;
};







/**
 * Read package.json file in specified path
 * 
 * @api private
 */

exports.getPackage = function (path, cb) {

	// Determine fs.readFile.*() function to use
	var readFile;

	path = _.str.rtrim(path, '/');

	var packageJSON;
	if (!cb) throw new Error('Callback required for sails.util.getPackage()!');
	if (cb === 'sync') {
		return andThen( fs.readFileSync(path + '/package.json', 'utf-8') );
	}
	fs.readFile(path + '/package.json', 'utf-8', function (err, file) {
		if (err) cb(err);
		andThen(file);
	});

	function andThen(packageJSON) {
		try {
			packageJSON = JSON.parse(packageJSON);
		} catch (e) {
			return false;
		}
		
		// Ensure dependencies are at least an empty object
		packageJSON.dependencies = packageJSON.dependencies || {};

		if ( cb === 'sync' ) return packageJSON;
		return cb(null, packageJSON);
	}
};






/**
 * getPackageSync
 *
 * Synchronous version of getPackage()
 * 
 * @api private
 */

exports.getPackageSync = function (path) {
	return exports.getPackage(path, 'sync');
};






/**
 * tolerantParse
 *
 * Parse specified JSON, but if it fails, 
 * return false instead of throwing.
 * 
 * @api private
 */

exports.tolerantParse = function ( json ) {
	var args = Array.prototype.slice.call(arguments);
	try {
		return JSON.parse.apply(this, args);
	} catch (e) {
		return false;
	}
};





/**
 * Wrapper for @isaacs' `json-stringify-safe`
 *
 * Automatically handles circular references.
 * See: https://github.com/isaacs/json-stringify-safe
 *
 * If stringification doesn't work, instead of throwing,
 * return false.
 * 
 * @api private
 */
exports.stringify = function ( json, serializer, indent, decycler ) {
	var args = Array.prototype.slice.call(arguments);
	try {
		return safeStringify.apply(this, args);
	}
	catch (e) {
		return false;
	}
};







// Underscore extensions for objects
_.extend(exports,{



	/**
	 * _.objMap
	 *
	 * _.map for objects, keeps key/value associations
	 * 
	 * @api private
	 */ 

	objMap: function(input, mapper, context) {
		return _.reduce(input, function(obj, v, k) {
			obj[k] = mapper.call(context, v, k, input);
			return obj;
		}, {}, context);
	},




	/**
	 * _.objFilter
	 *
	 * _.filter for objects, keeps key/value associations
	 * but only includes the properties that pass test().
	 * 
	 * @api private
	 */

	objFilter: function(input, test, context) {
		return _.reduce(input, function(obj, v, k) {
			if(test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	},




	/** 
	 * _.objReject
	 *
	 * _.reject for objects, keeps key/value associations
	 * but does not include the properties that pass test().
	 * 
	 * @api private
	 */

	objReject: function(input, test, context) {
		return _.reduce(input, function(obj, v, k) {
			if(!test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	},



	/**
	 * _.objInvoke
	 * 
	 * Usage:
	 *	obj -> the object
	 *	arguments* -> other arguments can be specified to be invoked on each of the functions
	 * 
	 * @api private
	 */

	objInvoke: function(obj) {
		var args = _.toArray(arguments).shift();
		return exports.objMap(obj, function(fn) {
			return fn(args);
		});
	}
	
});

















// DEPRECATED:
// /**
//  * Parse a url to determine the entity and actionName
 // * 
 // */ @api private/ 
 // */
// exports.parsePath = function(path) {
// 	// Split url and determine controller/action
// 	var pieces = path.split('/');
// 	var parsedPath = {
// 		controller: pieces.length > 1 && pieces[1],
// 		action: pieces.length > 2 && pieces[2]
// 	};
	
// 	// Only include id property if one was provided
// 	if (pieces.length > 3) {
// 		parsedPath.id = pieces[3];
// 	}
	
// 	return parsedPath;
// };

// *
//  * Parse a string to determine a controller/action based on 
//  * controller.action syntax  
 
// exports.parseStringRoute = function(routeStr) {
// 	// Split the url and find controller/action
// 	var entities = routeStr.split('.');
	
	
// 	var routeObj = {
// 		controller: entities[0]
// 	};
// 	// If action exists put it inside the routeObj
// 	if(entities[1]) {
// 		routeObj = _.extend(routeObj, { action: entities[1] });
// 	}

// 	return routeObj;
// };



// exports.isId = function(id) {
//   return _.isFinite(id) || /^[0-9a-f]{24}$/.test(id);
// };