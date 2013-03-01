//////////////////////////////////////////
// Dam
//////////////////////////////////////////
// Simple interceptor/transformer stream
 
// Allows for prefix string, suffix string, and custom iterator fn
 
// Set readable and writable in constructor.
// Inherit from base stream class.
var Dam = function(options) {
 
	if (options.prefix) {
		this.prefix = options.prefix;
	}
	if (options.suffix) {
		this.suffix = options.suffix;
	}
 
	// this.readable = true;
	this.writable = true;
 
 
	// initialize on next tick
	if (this.prefix) {
		var self = this;
		process.nextTick(function() {
			// Write prefix to stream if specified
			self.emit('data', self.prefix);
		});
	}
};
require('util').inherits(Dam, require('stream'));
 
// Extract args to `write` and emit as `data` event.
Dam.prototype.write = function(model, iterator, cb) {
	var self = this;
 
	iterator(model, function(err, transformedModel) {

		var outputModel;

		// Ensure that transformedModel is a string
		if (_.isString(transformedModel)) {
			outputModel = transformedModel;
		}

		// If not, try to make it one
		else if (_.isObject(transformedModel)) {
			try { outputModel = JSON.stringify(transformedModel); }
			catch (er) { return cb(er); }
		}
 
		// Write transformed model to stream
		self.emit('data', outputModel);
 
		// Inform that we're finished
		// Pass error back in callback, if one exists
		return cb(err);
	});
};
 
// If err set, emit `error`, otherwise emit `end` event.
Dam.prototype.end = function(err) {
	if (err) this.emit('error', err);
	else {
		if (this.suffix) {
			this.emit('data', this.suffix);
		}
		this.emit('end');
	}
};

module.exports = Dam;