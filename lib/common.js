////////////////////////////////////////////////////////////
// Sails
// common.js
////////////////////////////////////////////////////////////

// Define global configuration object
config = {};

// Module Dependencies
express = require('express');
ejs = require('ejs');
fs = require('fs');
path = require('path');
async = require('async');
Sequelize = require("sequelize");
_ = require('underscore');
Email = require("email").Email;

var rigging;

// Load and initialize the app
exports.lift = function liftSails (userConfig) {
	exports.load(userConfig,function(){
		exports.initialize(userConfig);
	});
}

// Utility fns
global._u = require('./util');

// Validate the userConfig parameter
function validateUserConfig (userConfig) {
	// Validate userConfig
	if (!userConfig) {
		throw new Error ("No configuration specified!");
	}
	else if (!userConfig.appPath) {
		throw new Error ("No appPath specified!");
	}
	else if (!userConfig.datasource) {
		throw new Error ("No datasource specified!");
	}
}

// Load the dependencies and app-specific components
exports.load = function loadSails (userConfig,cb) {

	validateUserConfig(userConfig);
	config = _.extend(userConfig,config);

	// Determine whether Rigging library is in place
	// to detect whether integrated Mast support should be enabled
	rigging = false;
	try {
		if (config.rigging) {
			console.log("Loading rigging lib...");
			config._riggingLib = rigging = require( 'rigging' );
		}
	}
	catch( e ) {
		rigging = false;
		if ( e.code === 'MODULE_NOT_FOUND' ) {
		// The module hasn't been found
		}
	}


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
	debug = require(__dirname+'/logger.js').debug;



	////////////////////////////////////////////////////////////
	// DB configuration
	////////////////////////////////////////////////////////////
	db = {
		model: null,
		sync: function (callback) {
			var opt = (config.datasource.dbCreate == "create") ? {force:true} : undefined;
			sequelize.sync(opt).success(function() {
				console.log("ORM sync successful!");
				callback && callback();
			});
		},
		bootstrap: function () {},
		initialize: function() {
			// Connect to database
			sequelize = db.model = new Sequelize(
				config.datasource.database, 
				config.datasource.username,
				config.datasource.password,
				{
					logging: config.datasource.logging || false,
					host: config.datasource.host || 'localhost',
					dialect: config.datasource.dialect || 'mysql',
					storage: config.datasource.storage || ':memory:',
					pool:   config.datasource.pool || undefined
				});
		}
	};
	
	////////////////////////////////////////////////////////////
	// App/Misc configuration
	////////////////////////////////////////////////////////////
	// Port to run the server on
	config.port = userConfig.port || 5008;


	// Name of application
	config.appName = userConfig.appName || "sails: Node.js MVC";

	// Environment to run this app in
	// One of: ["development", "production"]
	config.appEnvironment = userConfig.appEnvironment || "development";


	// Use Mast socket?
	config.mastSocket= (typeof mastSocket=='undefined') ? true : mastSocket;


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
	require(__dirname+'/model.js');

	// Setup sequelize
	db.initialize();

	// automatically grab all models from models directory
	// (if no 'id' attribute was provided, take a guess)
	// CASE INSENSITIVE
	global.modelNames = [];
	_.each(require('require-all')({
		dirname: config.appPath+'/models'
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
	db.sync(function(){
		console.log("**************");
		// Run boostrap script
		db.bootstrap();
		// HTTPs
		/*
	var app = module.exports = express.createServer({
		key: fs.readFileSync('ssl/private.key.pem'),
		cert: fs.readFileSync('ssl/combined.crt')
	});
	*/

		// HTTP
		//var app = module.exports = express.createServer();
		app = express.createServer();

		// Configuration
		// Enable JSONP
		app.enable("jsonp callback");

		app.configure(function() {
			app.set('views', config.appPath+'/views');
			app.set('view engine', 'ejs');
			app.use(express.bodyParser());
			app.use(express.methodOverride());
			app.use(express['static'](config.appPath+'/public'));

			// If this is development mode, and Rigging is in place 
			// allow direct browser access to Mast
			if (config.appEnvironment == 'development' && rigging) 
			{
				app.use(express['static'](config.appPath+'/mast'));
				app.use(express['static'](rigging.libPath()));
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
			dirname: config.appPath+'/services',
			filter: /(.+)\.js$/
		}),function (service, filename) {
			var serviceName = filename;
			global[serviceName] = service;
		});
		
		
		// Perform callback
		cb && cb();
	});


	
}


// Initialize the app (start the servers)
exports.initialize = function initSails (userConfig){

	validateUserConfig(userConfig);
	config = _.extend(userConfig,config);

	// Listen for websocket connections (and rejects) through socket.io
	var io = require('socket.io').listen(app);

	// Map Routes
	// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
	var router = require(__dirname + '/router');
	router.mapExpressRequests(app);
	router.mapSocketRequests(app,io);


	// Compile Mast components, if Rigging is in place
	if (rigging) {
		console.log("Initializing rigging...");
		rigging.compiler(config,startServers);
	}
	else {
		startServers();
	}
	
	// start the ws(s):// and http(s):// servers
	function startServers (){
	
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