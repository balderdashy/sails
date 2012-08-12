

/**
 * Return a 2nary version of the function, with null as its first argument
 */
exports.cbok = function cbok (cb) {return function(model){cb(null,model)}};

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
}