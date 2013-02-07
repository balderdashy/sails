module.exports= function (req,res) { 

    if(req.header('content-type') == 'application/json' || req.isAjax || req.isSocket) {
        res.send(404);
    } else {
        res.view('404', function (err) {
            else {
            	res.view('404');
            }
        })
    }
};