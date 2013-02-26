module.exports = function(req, res) {


	//If asking for json, ajax, or socket sens in json format
	if(req.isJson || req.isAjax || req.isSocket) {
		return res.send(404);
	}

	// If asking for an asset, return w/ a simple notfound
	if(req.is('text/css') || req.is('text/javascript') || req.is('html')) {
		return res.send(404);
	}

	// Otherwise serve up a webpage for 404 if the view exists.
	// If a view doesn't exist we still send json.
	else {
		try {
			res.view('404', function(err) {
				if(err) return res.send(404);
				else res.view('404');
			});
		} catch(e) {
			return res.send(404);
		}
	}
};
