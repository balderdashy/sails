module.exports = function set(sessionId, data, cb) {
	return sails.config.session.store.set(sessionId, data, cb);
};