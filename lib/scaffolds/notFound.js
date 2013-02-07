module.exports= function (req,res) { 
	//If asking for json, ajax, or socket sens in json format
    if(req.isJson || req.isAjax || req.isSocket) {
		console.log('test');
        res.send(404);
    }
	// Otherwise serve up a webpage for 404 if the view exists.
	// If a view doesn't exist we still send json.
    else {
        res.view('404', function (err) {
        	if (err) res.send(404);
            else res.view('404');
        })
    }
};