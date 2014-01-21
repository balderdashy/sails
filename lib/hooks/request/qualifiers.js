/**
 * Mix in convenience flags about this request
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinReqQualifiers(req, res) {
	var accept = req.get('Accept') || '';

	// Flag indicating whether HTML was explicitly mentioned in the Accepts header
	req.explicitlyAcceptsHTML = (accept.indexOf('html') !== -1);

	// Flag indicating whether a request would like to receive a JSON response
	req.wantsJSON = req.xhr;
	req.wantsJSON = req.wantsJSON || !req.explicitlyAcceptsHTML;
	req.wantsJSON = req.wantsJSON || (req.is('json') && req.get('Accept'));
};
