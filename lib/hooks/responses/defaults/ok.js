/**
 * Default responder for HTTP `200 OK` status.
 * 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
module.exports = function sendOK (data) {
	
	var req = this.req;
	var res = this.res;

	// Support JSONP and JSON
	if ( req.options.jsonp && !req.isSocket ) {
		return res.jsonp(data);
	}
	else {
		return res.json(data);
	}
};