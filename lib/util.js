/**
 * Parse a url to determine the entity and actionName
 */
exports.parsePath = function(path) {
	// Split url and determine controller/action
	var pieces = path.split('/');
	return {
		entity: pieces.length > 1 && pieces[1],
		action: pieces.length > 2 && pieces[2],
		id: pieces.length > 3 && pieces[3]
	};
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

exports.parseJSONish = function(someString) {
	// Check if string is safe to evaluate
	if(!exports.safeToEval(someString) || !someString) {
		return false;
	}
	// Then evaluate it and return the result
	else {
		var parsedJSON;
		eval("parsedJSON = (" + someString + ")");
		return parsedJSON;
	}
};

/**
 * Return a 2nary version of the function, with null as its first argument
 */
exports.cbok = function cbok(cb) {
	return function(model) {
		cb(null, model);
	};
};

_.unprefix = exports.cbok;

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
_.mixin({

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
		return _.objMap(obj, function(fn) {
			return fn(args);
		});
	}
});


// Recursive underscore methods
_.recursive = {

	// fn(value,keyChain)
	all: function(collection, fn, maxDepth) {
		if(!_.isObject(collection)) {
			return true;
		}

		// Default value for maxDepth
		maxDepth = maxDepth || 50;

		// Kick off recursive function
		return _all(collection, null, [], fn, 0);

		function _all(item, key, keyChain, fn, depth) {
			var lengthenedKeyChain = [];

			if(depth > maxDepth) {
				throw new Error('Depth of object being parsed exceeds maxDepth ().  Maybe it links to itself?');
			}

			// If the key is null, this is the root item, so skip this step
			// Descend
			if(key !== null && keyChain) {
				lengthenedKeyChain = keyChain.slice(0);
				lengthenedKeyChain.push(key);
			}

			// If the current item is a collection
			if(_.isObject(item)) {
				return _.all(item, function(subval, subkey) {
					return _all(subval, subkey, lengthenedKeyChain, fn, depth + 1);
				});
			}
			// Leaf items land here and execute the iterator
			else {
				return fn(item, lengthenedKeyChain);
			}
		}
	},

	// fn(original,newOne,anotherNewOne,...)
	extend: function(original, newObj) {

		// return _.extend(original,newObj);
		// TODO: make this work for more than one newObj
		// var newObjects = _.toArray(arguments).shift();

		return _.extend(original, _.objMap(newObj, function(newVal, key) {
			var oldVal = original[key];

			// If the new value is a non-object or array or function,
			// or the old value is a non-object or array, use it
			if ((_.isObject(newVal) && _.isFunction(newVal)) || _.isArray(newVal) || !_.isObject(newVal) || _.isArray(oldVal) || !_.isObject(oldVal)) {
				return !_.isUndefined(newVal) ? newVal : oldVal;
			}
			// Otherwise, we have to descend recursively
			else {
				return _.recursive.extend(oldVal, newVal);
			}
		}));
	},

	// fn(original,newOne,anotherNewOne,...)
	defaults: function(original, newObj) {
		// TODO: make this work for more than one newObj
		// var newObjects = _.toArray(arguments).shift();

		// return _.defaults(original,newObj);

		return _.defaults(original, _.objMap(newObj, function(newVal, key) {
			var oldVal = original[key];

			// If the new value is a non-object or array, 
			// or the old value is a non-object or array, use it
			if((_.isObject(newVal) && _.isFunction(newVal)) || _.isArray(newVal) || !_.isObject(newVal) || _.isArray(oldVal) || !_.isObject(oldVal)) {
				return !oldVal ? newVal : oldVal;
			}
			// Otherwise, we have to descend recursively
			else {
				return _.recursive.defaults(oldVal, newVal);
			}
		}));
	}
};