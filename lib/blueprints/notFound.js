module.exports = function(req, res) {


	// If asking for json, ajax, or socket send simple error code
	if(req.isJson || req.isAjax || req.isSocket) {
		return res.send(404);
	}

	// If asking for an asset, return w/ a simple error code
	if(req.is('text/css') || req.is('text/javascript') || req.is('html')) {
		return res.send(404);
	}

	// Otherwise serve up a webpage if the view exists.
	// If a view doesn't exist, still send a simple error code
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
