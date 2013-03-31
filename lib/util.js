var _ = require('underscore');
_.str = require('underscore.string');

// exports.isId = function(id) {
//   return _.isFinite(id) || /^[0-9a-f]{24}$/.test(id);
// };

/**
 * Parse a url to determine the entity and actionName
 */
exports.parsePath = function(path) {
	// Split url and determine controller/action
	var pieces = path.split('/');
	var parsedPath = {
		entity: pieces.length > 1 && pieces[1],
		action: pieces.length > 2 && pieces[2]
	};
	
	// Only include id property if one was provided
	if (pieces.length > 3) {
		parsedPath.id = pieces[3];
	}
	
	return parsedPath;
};

/**
 * Parse a string to determine a controller/action based on 
 * controller.action syntax  
 */
exports.parseStringRoute = function(routeStr) {
	// Split the url and find controller/action
	var entities = routeStr.split('.');
	
	
	var routeObj = {
		controller: entities[0]
	};
	// If action exists put it inside the routeObj
	if(entities[1]) {
		routeObj = _.extend(routeObj, { action: entities[1] });
	}

	return routeObj;
};

/**
 * Run a method meant for a single object on a object OR array
 * For an object, run the method and return the result.
 * For a list, run the method on each item return the resulting array.
 * For anything else, return it silently.
 */
exports.pluralize = function pluralize(collection, application) {
	if(_.isArray(collection)) {
		return _.map(collection, application);
	} else if(_.isObject(collection)) {
		return application(collection);
	} else return collection;
};

/**
 * Detect if a string is safe to eval()
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
 * Detect if a string is JSON
 */
exports.isJSON = function(someString) {
	try {
		JSON.parse(someString);
	} catch(e) {
		return false;
	}
	return true;
};
/**
 * Detect if a string is JSON (or is close enough)
 */
exports.isJSONish = function(someString) {
	// Check if string is safe to evaluate
	return exports.safeToEval(someString);

	// TODO: something more relevant
};


/**
 * Return a 2nary version of the function, with null as its first argument
 */
exports.unprefix = function cbok(cb) {
	return function(model) {
		cb(null, model);
	};
};

/**
 * Return the specified function without the first argument, but apply it in a closure
 */
exports.preface = function preface(fn, action, context) {
	return function(model, cb) {
		if(context) {
			fn.call(context, fn, action);
		} else {
			fn(action, model, cb);
		}
	};
};

// Mix in some commonly used underscore fns
_.extend(exports,{

	// Return whether the given object is an instance of Error
	isError: function (e) {
		return e instanceof Error;
	},

	// Really LOUD version of console.log.debug
	shout: function() {
		var args = _.values(arguments);

		console.log("\n");
		if(args.length == 1) {
			console.log("*", args[0]);
		} else {
			console.log("*", args.shift());
			console.log("------------------------------");
			args.length > 0 && _.each(args, function(arg) {
				console.log("   => ", arg, "   (" + (typeof arg) + ")");
			});
		}
	},

	// Get the file extension
	fileExtension: function(str) {
		if(str === null) return '';
		var pieces = String(str).split('.');
		return pieces.length > 1 ? _.last(pieces) : '';
	},

	// Pretty rendering of things like: 1st, 2nd, 3rd, 4th
	th: function(integer) {
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
		} else {
			sails.log.debug("You specified: ", integer);
			throw new Error("But _.th only works on integers!");
		}
	},

	// ### _.objMap
	// _.map for objects, keeps key/value associations
	objMap: function(input, mapper, context) {
		return _.reduce(input, function(obj, v, k) {
			obj[k] = mapper.call(context, v, k, input);
			return obj;
		}, {}, context);
	},
	// ### _.objFilter
	// _.filter for objects, keeps key/value associations
	// but only includes the properties that pass test().
	objFilter: function(input, test, context) {
		return _.reduce(input, function(obj, v, k) {
			if(test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	},
	// ### _.objReject
	//
	// _.reject for objects, keeps key/value associations
	// but does not include the properties that pass test().
	objReject: function(input, test, context) {
		return _.reduce(input, function(obj, v, k) {
			if(!test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	},

	/**
	 * Usage:
	 *	obj -> the object
	 *	arguments* -> other arguments can be specified to be invoked on each of the functions
	 */
	objInvoke: function(obj) {
		var args = _.toArray(arguments).shift();
		return exports.objMap(obj, function(fn) {
			return fn(args);
		});
	}
});
