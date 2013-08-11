
/**
 * Not fully supported yet-
 * see https://github.com/nkzawa/socket.io-stream
 */

module.exports = ResStream;

// Set readable and writable in constructor.
// Inherit from base stream class.
function ResStream () {
	this.writable = true;
}
require('util').inherits(ResStream, require('stream'));

// Extract args to `write` and emit as `data` event.
// Optional callback
ResStream.prototype.write = function(str) {
	// Fire 'data' event on socket
	this.socket.emit('data', str);
};

// If err set, emit `error`, otherwise emit `end` event.
// Optional callback
ResStream.prototype.end = function(err) {
	if (err) {
		this.emit('error', err);
		this.socket.emit('error', err);
	}
	else this.socket.emit('end');
};