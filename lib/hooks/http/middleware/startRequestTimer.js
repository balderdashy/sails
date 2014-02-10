/**
 * Track request start time as soon as possible
 * TODO: consider including connect.logger by default
 * (https://github.com/senchalabs/connect/blob/master/lib/middleware/logger.js)
 */
module.exports = function startRequestTimer (req, res, next) {
	req._startTime = new Date();
	next();
};
