// Interpret a socket.io request to express js semantics
exports.interpret = function (socketIOData,socketIOCallback,socket,app) {

	// Build request object
	var req = {	
		_socketIOPretender: true,
		
		params: {}
	};

	// Fetch express session object
	req.session = socket.handshake.session;
	

	var res = exports.res = {
		_socketIOPretender: true,
	
		send: function(body) {
			socketIOCallback(body);
		}
	};


	// Send json response
	res.json = function(obj, status){
		var body = JSON.stringify(obj);
		this.charset = this.charset || 'utf-8';
		return this.send(body, status);
	};
	
	// Render a view
	res.render = function(view, options, fn) {		
		
		fs.readFile(app.settings.views+"/"+view, "utf-8",function(err, template) {
			if (err) {
				sendError("No such view, '"+view+"', exists!");
				debug.warn(err);
			}
			else res.send(ejs.render(template,{
				session: req.session,
				title: options && options.title
			}));
		});
	};

	////// TODO ////////////////////////////
	res.contentType =
	res.type = function(type){
		return this.set('Content-Type', ~type.indexOf('/')
			? type
			: mime.lookup(type));
	};
	
	
	////// TODO ////////////////////////////
	res.set = 
	res.header = function(field, val){
		return sendError("Not currently supported!");
		if (2 == arguments.length) {
			this.setHeader(field, val);
		} else {
			for (var key in field) {
				this.setHeader(key, field[key]);
			}
		}
		return this;
	};

	////// TODO ////////////////////////////
	res.get = function(field){
		return sendError("Not currently supported!");
		return this.getHeader(field);
	};


	////// TODO ////////////////////////////
	// Clear a cookie
	res.clearCookie = function(name, options){
		return sendError("Not currently supported!");
		var opts = {
			expires: new Date(1), 
			path: '/'
		};
		return this.cookie(name, '', options
			? utils.merge(opts, options)
			: opts);
	};
	
	////// TODO ////////////////////////////
	// Set a signed cookie
	res.signedCookie = function(name, val, options){
		return sendError("Not currently supported!");
		var secret = this.req.secret;
		if (!secret) throw new Error('connect.cookieParser("secret") required for signed cookies');
		if ('object' == typeof val) val = 'j:' + JSON.stringify(val);
		val = utils.sign(val, secret);
		return this.cookie(name, val, options);
	};

	////// TODO ////////////////////////////
	// Set cookie
	res.cookie = function(name, val, options){
		return sendError("Not currently supported!");
		options = options || {};
		if ('object' == typeof val) val = 'j:' + JSON.stringify(val);
		if ('maxAge' in options) options.expires = new Date(Date.now() + options.maxAge);
		if (null == options.path) options.path = '/';
		var cookie = utils.serializeCookie(name, val, options);
		this.set('Set-Cookie', cookie);
		return this;
	};

	////// TODO ////////////////////////////
	// Redirect to a different URL
	res.redirect = function(url){
		// TODO: retry the routing table with the given url
		return sendError("res.redirect() not currently supported from a socket.io client!\nDoing nothing!");
	};


	function sendError(errmsg) {
		debug.warn(errmsg);
		res.json({
			error: errmsg,
			success: false
		});
	}


	return {
		'res': res,
		'req': req
	};
};