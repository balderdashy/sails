/**
 * Error Policy Fixture
 *
 * Sends an Error Object to the callback
 */

module.exports = function(req, res, next) {
  return res.serverError('Test Error');
};
