/**
 * Parse a url to determine the entity and actionName
 */
exports.parsePath = function(path){
	// Split url and determine controller/action
	var pieces = path.split('/');
	return {
		entity		: pieces[1],
		actionName	: pieces[2]
	};
};

/**
* Detect if a string is safe to eval()
*/
exports.safeToEval = function (someString) {
	return true;
	try {
		!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(someString.replace(/"(\\.|[^"\\])*"/g, ''))) && eval('(' + someString + ')');
	}
	catch (e) {
		return false;
	}
	return true;
};
/**
* Detect if a string is JSON
*/
exports.isJSON = function (someString) {
	try { JSON.parse(someString); }
	catch (e) { return false; }
	return true;
};
/**
* Detect if a string is JSON (or is close enough)
*/
exports.isJSONish = function (someString) {
	// Check if string is safe to evaluate
	return exports.safeToEval(someString);

	// TODO: something more relevant
};

exports.parseJSONish = function (someString) {
	// Check if string is safe to evaluate
	if (!exports.safeToEval(someString) || !someString) {
		return false;
	}
	// Then evaluate it and return the result
	else {
		// someString = JSON.stringify(someString);
		// var parsedJSON = JSON.parse(someString);
		// return parsedJSON;

		// Replace actual newlines with \n newlines to allow eval to do its job
		var singleQuotedValues = someString.match(/'[^']*'/g) || [];
		var doubleQuotedValues = someString.match(/"[^"]*"/g) || [];
		var values = singleQuotedValues.concat(doubleQuotedValues);
		_.each(values,function(origVal) {
			var newVal = origVal.replace(/\n/g,"\\n");
			someString = someString.replace(origVal,newVal);
		});
		
		var parsedJSON;
		eval("parsedJSON = ("+someString+")");
		return parsedJSON;
	}
};

/**
 * Return a 2nary version of the function, with null as its first argument
 */
exports.cbok = function cbok (cb) {
	return function(model){
			cb(null,model);
		};
	};

_.unprefix = exports.cbok;

/**
 * Return the specified function without the first argument, but apply it in a closure
 */
exports.preface = function preface (fn,action,context) {
	return function (model,cb) {
		if (context) {
			fn.call(context,fn,action);
		}
		else {
			fn(action,model,cb);
		}
	};
};

// Mix in some commonly used underscore fns
_.mixin({

	// Really LOUD version of console.log
	shout: function() {
		var args = _.values(arguments);
		
		console.log("\n");
		if (args.length == 1) {
			console.log("*",args[0]);
		}
		else {
			console.log("*",args.shift());
			console.log("------------------------------");
			args.length > 0 && _.each(args, function(arg){
				console.log("   => ",arg, "   ("+(typeof arg)+")");
			});
		}
	},

	// Pretty rendering of things like: 1st, 2nd, 3rd, 4th
	th: function (integer) {
		if (_.isFinite(+integer) && Math.floor(+integer) === +integer) {
			var lastDigit = +integer % 10;
			var lastTwoDigits = +integer % 100;
			var response = integer + "";

			// Handle n-teen case
			if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
				return response+"th";
			}

			// Handle general case
			switch (lastDigit) {
				case 1: return response+"st";
				case 2: return response+"nd";
				case 3: return response+"rd";
				default: return response+"th";
			}
		}
		else {
			console.log("You specified: ",integer);
			throw new Error ("But _.th only works on integers!");
		}
	},

	// ### _.objMap
	// _.map for objects, keeps key/value associations
	objMap: function (input, mapper, context) {
		return _.reduce(input, function (obj, v, k) {
			obj[k] = mapper.call(context, v, k, input);
			return obj;
		}, {}, context);
	},
	// ### _.objFilter
	// _.filter for objects, keeps key/value associations
	// but only includes the properties that pass test().
	objFilter: function (input, test, context) {
		return _.reduce(input, function (obj, v, k) {
			if (test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	},
	// ### _.objReject
	//
	// _.reject for objects, keeps key/value associations
	// but does not include the properties that pass test().
	objReject: function (input, test, context) {
		return _.reduce(input, function (obj, v, k) {
			if (!test.call(context, v, k, input)) {
				obj[k] = v;
			}
			return obj;
		}, {}, context);
	}
});
