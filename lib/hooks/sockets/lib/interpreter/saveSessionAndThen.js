/**
 * Used to save session automatically when:
 *   + res.send() or res.json() is called
 *   + res.redirect() is called
 *   + TODO: res receives an 'end' event from a stream piped into it
 * 
 * @param  {Request} req
 * @param  {Sails} sails
 * @param  {Function} cb
 * @return {Function} which persists session data, then triggers callback.
 */

module.exports = function saveSessionAndThen(req, sails, cb) {

	return function saveSession () {
		var ctx = this,
			args = Array.prototype.slice.call(arguments);
		var next = function (err) {
			if (err) {
				sails.log.error('Session could not be persisted:',err);
			}
			cb.apply(ctx,args);
		};

		// If we have a session on the request, save it
		// Otherwise, process the callback on the next tick
		if (req.session) {
			req.session.save(next);
		} else {
			process.nextTick(next);
		}
	};
};
