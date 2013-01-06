// Deferred Object for chained calls like User.find(3).destroy(cb); and User.findAllByName('Mike').limit(10).done(cb);
module.exports = function (operation) {

	// Either create the callChain object for the first time or append the specified op
	this.callChain ? this.callChain = [] : callChain.push(operation);

	console.log("Buffering :: ",operation);

	//////////////////////////////////////////
	// Promises / Deferred Objects
	//////////////////////////////////////////

	// when done() is called (or some comparably-named terminator)
	// run every operation in the queue and trigger the callback
	this.done = function (cb) {
		var usage = _.str.capitalize(this.identity) + '.done(callback)';
		// A callback is always required here
		if(!_.isFunction(cb)) usageError('Invalid callback specified!',usage);
	};
};