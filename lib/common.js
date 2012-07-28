// Module Dependencies
express = require('express');
ejs = require('ejs');
fs = require('fs');
path = require('path');
async = require('async');
Sequelize = require("sequelize");
_ = require('underscore');
Email = require("email").Email;

// Connect dependency requirements
sessionStore = new express.session.MemoryStore();
sessionSecret = "k3yboard_kat";
sessionKey = 'sails.sid';


// EXPERIMENTAL connect v2 support
// see https://github.com/senchalabs/connect/issues/588
//var connect = require('connect');
//var connectCookie = require('cookie');
//var cookieSecret = "k3yboard_kat";
//parseCookie = function(cookie) {
//	return connect.utils.parseSignedCookies(connectCookie.parse(decodeURIComponent(cookie)),cookieSecret);
//}

var connect = require('connect');
parseCookie = connect.utils.parseCookie;
ConnectSession = connect.middleware.session.Session;

// Set up logger
debug = require(__dirname+'/../lib/logger.js').debug;

// Configuration
if (! path.existsSync(__dirname+'/../config/db.js')) {
	throw new Error ('No database configuration file found!');
}
db = require(__dirname+'/../config/db'); 
config = require(__dirname+'/../config/app');
require(__dirname+'/../config/log');


// App-wide logic additions --------
// Convenience variable for sequelize query chainer 
QueryChainer = Sequelize.Utils.QueryChainer;

// Add capitalization method to String class
String.prototype.toCapitalized = function ()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}
// ------------------------------------


// Import model library
require(__dirname+'/../lib/model.js');

// Setup sequelize
db.initialize();

// automatically grab all models from models directory
// (if no 'id' attribute was provided, take a guess)
// CASE INSENSITIVE
global.modelNames = [];
_.each(require('require-all')({
	dirname: __dirname + '/../models'
	,  
	filter: /(.+)\.js$/
}),function (model, filename) {
	var className = model.id || filename;
	className = className.toCapitalized();
	global.modelNames.push(className);
});

// Set up ORM with DB
_.each(global.modelNames,function (className) {
	global[className] = global[className].initialize(className);
});

// Create/verify domain associations
_.each(global.modelNames,function (className) {
	Model.createAssociations(global[className]);
});

// Sync again to absorb any new tables created due to N->N associations
// TODO wait until this is finished before proceeding
db.sync();


// Run boostrap script
db.bootstrap();
// HTTPs
/*
var app = module.exports = express.createServer({
    key: fs.readFileSync('ssl/private.key.pem'),
    cert: fs.readFileSync('ssl/combined.crt')
});
*/

// Determine whether Rigging library is in place
// to detect whether integrated Mast support should be enabled
var riggingInPlace = path.existsSync(__dirname + '/rigging');

// HTTP
//var app = module.exports = express.createServer();
var app = express.createServer();

// Configuration
// Enable JSONP
app.enable("jsonp callback");

app.configure(function() {
	app.set('views', __dirname + '/../views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express['static'](__dirname + '/../public'));
  
	// If this is development mode, 
	// and Rigging is in place allow direct access to Mast
	if (config.appEnvironment == 'development' && riggingInPlace) 
	{
		app.use(express['static'](__dirname + '/../mast'));
		app.use(express['static'](__dirname + '/rigging'));
	}
  
	// Session / cookie support
	app.use(express.cookieParser());
	app.use(express.session({
		secret: sessionSecret
		, 
		store: sessionStore
		, 
		key: sessionKey
	}));
	
	// Set up router
	app.use(app.router);
});


// Set up error handling
app.configure('development', function(){
	app.use(express.errorHandler({
		dumpExceptions: true, 
		showStack: true
	})); 
});
app.configure('production', function(){
	app.use(express.errorHandler());
});

// By convention, serve .js files using the ejs engine
app.register('.js', ejs);


// Automatically grab and instantiate services from directory
// CASE SENSITIVE :: USES FILENAME (i.e. ApiService)
_.each(require('require-all')({
	dirname: __dirname + '/../services',
	filter: /(.+)\.js$/
}),function (service, filename) {
	var serviceName = filename;
	global[serviceName] = service;
});



// Called from main.js to start the ws(s):// and http(s):// servers
exports.startServers = function (){

	// Listen for websocket connections (and rejects) through socket.io
	var io = require('socket.io').listen(app);

	// Map Routes
	// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
	var router = require(__dirname + '/../lib/router');
	router.mapExpressRequests(app);
	router.mapSocketRequests(app,io);


	// Compile Mast components, if Rigging is in place
	if (riggingInPlace) {
		require(__dirname + '/compiler').compile(initialize);
	}
	else {
		initialize();
	}
	
	
	// Initialize the app
	function initialize (){
	
		// Start http(s):// server
		app.listen(config.port);
		if (!app.address()) {
			debug.warn('Error detecting app.address() -- perhaps the port is already in use?')
		}
		else {
			debug.debug("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
		}
	
		// Configure auth for ws(s):// server
		io.set('authorization', function (data, accept) {
			// Attach authorization middleware to socket event receiver
			if (data.headers.cookie) {
				data.cookie = parseCookie(data.headers.cookie);
				data.sessionID = data.cookie[sessionKey];
				data.sessionStore = sessionStore;

				// (literally) get the session data from the session store
				sessionStore.get(data.sessionID, function (err, session) {
					if (err || !session) {
						// if we cannot grab a session, turn down the connection
						accept('Cannot load session from socket.io! (perhaps session id is invalid?)\n'+err, false);
					} else {
						// save the session data and accept the connection
						// create a session object, passing data as request and our
						// just acquired session data
						data.session = new ConnectSession(data, session);
						accept(null, true);
					}
				});
			} else {
				return accept('No cookie transmitted with socket.io connection.', false);
			}
		});
	}
}
