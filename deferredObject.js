var _ = require('underscore');
_.str = require('underscore.string');
var async = require('async');

// Deferred Object for chained calls like User.find(3).destroy(cb); and User.findAllByName('Mike').limit(10).done(cb);
module.exports = function (operation) {

	// Create the callChain list for the first time and append the specified op
	this.callChain = [operation];

	// console.log("Buffering :: ",operation.collection.identity,operation.method,operation.args);

	//////////////////////////////////////////
	// Promises / Deferred Objects
	//////////////////////////////////////////

	// when done() is called (or some comparably-named terminator)
	// run every operation in the queue and trigger the callback
	this.done = function (cb) {
		// A callback is always required here
		var usage = _.str.capitalize(this.identity) + '.done(callback)';
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);

		// Iterate through each operation in the call chain
		// If an error is detected, stop
		if (_.isArray(this.callChain) && this.callChain.length > 0) {

			// Used if a resultSet must be returned
			var resultSet;

			async.forEachSeries(this.callChain, function (promise, cb) {
				var methodName = promise.method;
				var method = promise.collection && promise.collection[methodName];
				if (!method) cb(new Error(promise.method+' doesn\'t exist in '+promise.collection.identity));

				// Tack callback onto existing arguments
				method.apply(promise.collection, promise.args.concat([function (err,data) {
					if (err) return cb(err);

					// Manage result set differently dependending on the method
					if (methodName === 'find') {
						if (resultSet) err = "find() cannot be called more than once in the same chain!";
						resultSet = data;
						return cb(err,data);
					}
					else if (methodName === 'findAll') {
						if (resultSet) err = "findAll() cannot be called more than once in the same chain!";
						resultSet = data;
						return cb(err,data);
					}
					else throw new Error ('Unknown chained method: '+methodName);
				}]));
				
			}, function (err) {
				// Delete this deferred object
				// TODO

				// Return to caller
				return cb(err, resultSet);
			});
		}
		else throw new Error ('Trying to resolve a deferred object, but the call chain is invalid!');
	};
};