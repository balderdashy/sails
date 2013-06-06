module.exports = function get(sessionId, cb) {
	return sails.config.session.store.get(sessionId, cb);
};