/**
 * Default 200 (OK) Handler
 * 
 * @param  {Object} data
 * @param  {Boolean|String} viewOrRedirect
 *         [optional]
 *          - pass `true` to render default view
 *          - pass string to render specified view
 *          - pass string with leading slash or http:// or https:// to do redirect
 */

module.exports = function sendOK (data, viewOrRedirect) {
	
	var req = this.req;
	var res = this.res;

	// Serve JSON (with optional JSONP support)
	if (req.wantsJSON || !viewOrRedirect) {
		if ( req.options.jsonp && !req.isSocket ) {
			return res.jsonp(data);
		}
		else return res.json(data);
	}

	// Serve HTML view or redirect to specified URL
	if (typeof viewOrRedirect === 'string') {
		if (viewOrRedirect.match(/^(\/|http:\/\/|https:\/\/)/)) {
			return res.redirect(viewOrRedirect);
		}
		else return res.view(viewOrRedirect, data);
	}
	else return res.view(data);
};