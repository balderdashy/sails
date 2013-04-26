/**
 * Error Policy Fixture
 *
 * Sends an Error Object to the callback
 */

module.exports = function(req, res, next) {
  next(new Error('Test Error'));
};