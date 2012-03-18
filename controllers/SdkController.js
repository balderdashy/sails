exports.javascript = function (req, res, next ) {		
	res.header('Content-Type', 'text/javascript');
	res.render('crud.io.client.js',{
		layout: false,
		serverUrl: "http://" + req.headers.host
	});
}