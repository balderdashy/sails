// stream.js
// --------------------
//
// Simple db-agnostic streaming API with support for Transformations
////////////////////////////////////////////////////////////////////////////////////

var _ = require('underscore');

// Build set of transformations
// (this may be moved into a formal, user-specifiable place in sails.js in the future)
var transformations = {
	
	// Emit a model as part of a JSON object
	json: {

		// 'write' is fired every time data comes through
		// should handle prefix
		write: function (model, index, cb) {
			var transformedModel;
			if (model) {
				try {
					transformedModel = JSON.stringify(model);
				} 
				catch (e) { return cb(e); }
			}
			// If model unspecified, use empty string
			else transformedModel = '';

			// Prefix with opening [
			if (index === 0) {
				transformedModel = '[';
			}

			// No comma the first time
			else if (index === 1) { }

			// Prefix with comma after that
			else if (index > 1) {
				transformedModel = ',' + transformedModel;
			}

			cb(null, transformedModel);
		},

		// 'end' is an opportunity to write a suffix
		end: function (cb) {
			var suffix = ']';
			cb(null, suffix);
		}
	}
};

// Allows for prefix string, suffix string, and custom iterator fn

// Set readable and writable in constructor.
// Inherit from base stream class.
var ModelStream = function(transformation) {

	// Use specified, or otherwise default, JSON transformation
	this.transformation = transformation || transformations.json;

	// Reset write index
	this.index = 0;

	// this.readable = true;
	this.writable = true;
};
require('util').inherits(ModelStream, require('stream'));

// Extract args to `write` and emit as `data` event.
// Optional callback
ModelStream.prototype.write = function(model, cb) {
	var self = this;

	// Run transformation on this item
	this.transformation.write(model, this.index, function writeToStream(err, transformedModel) {
		// Increment index for next time
		self.index++;

		// Write transformed model to stream
		self.emit('data', _.clone(transformedModel));

		// Inform that we're finished
		// Pass error back in callback, if one exists
		return cb && cb(err);
	});

};

// If err set, emit `error`, otherwise emit `end` event.
// Optional callback
ModelStream.prototype.end = function(err, cb) {
	var self = this;
	if (err) {
		this.emit('error', err);
		return cb && cb(err);
	}
	else {
		this.transformation.end(function (err, suffix) {
			if (err) {
				self.emit('error', err);
				return cb && cb(err);
			}
			
			// Emit suffix if specified
			if (suffix) self.emit('data',suffix);
			self.emit('end');
			return cb && cb(err);
		});
	}
};

module.exports = ModelStream;