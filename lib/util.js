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
}


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
		
		console.log("******************************");
		console.log(args.shift());
		console.log("******************************");
		args.length > 0 && _.each(args, function(arg){
			console.log("   => ",arg, "   ("+(typeof arg)+")");
		});
		console.log("******************************");
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
