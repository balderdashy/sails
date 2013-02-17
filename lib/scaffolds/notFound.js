module.exports= function (req,res) { 
	//If asking for json, ajax, or socket sens in json format
    if(req.isJson || req.isAjax || req.isSocket) {
        return jsonNotFound(req,res);
    }
	// Otherwise serve up a webpage for 404 if the view exists.
	// If a view doesn't exist we still send json.
    else {
        try {
            res.view('404', function (err) {
                if (err) return jsonNotFound(req,res);
                else res.view('404');
            });
        }
        catch(e) {
            return jsonNotFound(req,res);
        }
    }
};

function jsonNotFound (req,res) {
    return res.send(404);
}