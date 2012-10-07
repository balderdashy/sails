////////////////////////////////////////////////////////////
// Sails
// common.js
////////////////////////////////////////////////////////////

// Define global app state object
sails = {};

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
_.str = require('underscore.string');											// Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_.mixin(_.str.exports());														// Mix in non-conflict functions to Underscore namespace if you want
_.str.include('Underscore.string', 'string'); // => true						// All functions, including conflicts, will be available through _.str object
Email = require("email").Email;


// Load and initialize the app
exports.lift = function liftSails (userConfig) {
	exports.load(userConfig,function() {
		exports.initialize(userConfig);
	});
};

// Utility fns
global._u = require('./util');

// Validate the userConfig parameter
function validateUserConfig (userConfig) {
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
	try {
		console.log("Loading rigging lib...");
		config.rigging = require( 'rigging' );
		console.log("Rigging loaded successfully!");
	}
	catch( e ) {
		config.rigging = false;
		if ( e.code === 'MODULE_NOT_FOUND' ) {
			console.log("Rigging could not be found.");
		}
		else {
			console.log("Error occured:",e);
		}
	}


	// Connect dependency requirements
	sessionStore = new express.session.MemoryStore();
	sessionSecret = config.sessionSecret || "k3yboard_kat";
	sessionKey = config.sessionKey || 'sails.sid';


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
			var opt = (config.datasource.dbCreate == "create") ? {
				force:true
			} : undefined;
			sequelize.sync(opt).success(function() {
				console.log("ORM sync successful!");
				callback && callback();
			});
		},
		// Use custom bootstrap function if specified in config, otherwise do nothing
		bootstrap: _.isFunction(config.bootstrap) ? config.bootstrap : function () {},
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
	config.port = userConfig.port || 1337;


	// Name of application
	config.appName = userConfig.appName || "SailsJS";

	// Environment to run this app in
	// One of: ["development", "production"]
	config.appEnvironment = userConfig.appEnvironment || "development";

	// Use Mast socket?
	config.mastSocket= (typeof mastSocket=='undefined') ? true : mastSocket;


	// App-wide logic additions --------
	// Convenience variable for sequelize query chainer 
	//	QueryChainer = Sequelize.Utils.QueryChainer;


	// Import ORM library
	require(__dirname+'/orm.js');

	// Setup sequelize
	db.initialize();

	// automatically grab all models from models directory
	// (if no 'id' attribute was provided, take a guess)
	// CASE INSENSITIVE
	var modelNames = [];
	_.each(require('require-all')({
		dirname: config.appPath+'/models',
		filter: /(.+)\.js$/
	}),function (model, filename) {
		var className = model.identity || filename;
		className = _.str.capitalize(className);
		modelNames.push(className);
	});

	// Set up ORM with DB
	_.each(modelNames,function (className) {
		global[className] = global[className].initialize(className);
	});

	// Create/verify domain associations
	_.each(modelNames,function (className) {
		Model.createAssociations(global[className]);
	});
	
	// HACKY FIX FOR SEQUELIZE ISSUES:
	_.each(modelNames,function (className) {
		

		//		// Override .findAll() to allow empty [] for IN queries
		//		global[className]._sails_originalFindAllMethod = global[className].findAll;
		//		global[className].findAll = function(options) {
		//			if (options && options.where) {
		//				options.where = _.map(options.where,function(value,attributeName) {
		//					if (_.isArray(value) && value.length == 0) { 
		//						debug.warn("**************** WARNING! ****************",
		//							"You are trying to run a findAll() IN query with an empty array.",
		//							"There is a bug in Sequelize which does not allow this case.",
		//							"SailsJS has intercepted this error and subbed out an obnoxiously unlikely array instead.");
		//						return [9425723962,334969,5345254,29359];
		//					}
		//					else {
		//						return value;
		//					}
		//				});
		//			}
		//			return this._sails_originalFindAllMethod(options);
		//		}

		
		// Override .find() to allow strings
		// https://github.com/sdepold/sequelize/issues/78
		global[className]._sails_originalFindMethod = global[className].find;
		global[className].find = function(options) {
			if(typeof options == 'string') {
				options = parseInt(options,10);
			}
			return this._sails_originalFindMethod(options);
		};
	});
	
	_.each(modelNames,function (className) {
		var Model = global[className], modelName = Model.getModelName();
		// Set class room names
		Model.classRoom = modelName;
		// Define getter for instance room names
		Model.__defineGetter__('instanceRoom',function() {
			if (!this.id) {
				debug.warn("Trying to access instanceRoom name for instance w/o an id!  Using "+modelName + "/0");
				this.id = 0;
			}
			return modelName + "/"+this.id;
		});
	});

	// Sync again to absorb any new tables created due to N->N associations
	db.sync(function(){
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
		if( _.isUndefined( config.serverOptions ))
			app = express.createServer();
		else
			app = express.createServer( config.serverOptions );

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
			if (config.appEnvironment == 'development' && config.rigging) 
			{
				app.use(express['static'](config.appPath+'/mast'));
				app.use(express['static'](config.rigging.libPath()));
			}

			// Session / cookie support
			app.use(express.cookieParser());
			app.use(express.session({
				secret: sessionSecret,
				store: sessionStore, 
				key: sessionKey
			}));

			// Add annoying Sails header instead of annoying Express header
			app.use(function (req, res, next) {
				res.header("X-Powered-By",'Sails <sailsjs.com>)');
				next();
			});

			// Allow usage of custom express middleware
			if( _.isFunction(config.customMiddleware) ) {
				config.customMiddleware(app);
			}

			// Set up express router
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
	io = require('socket.io').listen(app);

	// Set up controllers
	sails.controllers = require(__dirname + '/controllers').controllers;

	// Map Routes
	// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
	var router = require(__dirname + '/router');
	
	// Link Express HTTP requests to a function which handles them
	router.listen(function (url,fn,httpVerb) {
		// TODO: Use all,get,post,put,or delete conditionally based on http verb
		// null === *any* of the HTTP verbs
		app.all(url,fn);
	});

	// TODO: implement this in ** rudder **
	// Link Socket.io requests to a controller/action
	router.mapSocketRequests(app,io);


	// Compile Mast components, if Rigging is in place
	if (config.rigging) {
		console.log("Initializing rigging...");
		config.rigging.compiler(config,startServers);
	}
	else {
		startServers();
	}

	if( _.isFunction( config.beforeShutdown )) 
	{
		process.on('SIGINT', function() {
			process.exit();
		});
		process.on( 'SIGTERM', function() {
			process.exit();
		} );
		process.on( 'exit', function() {
			config.beforeShutdown();
		} );
	}
	
	// start the ws(s):// and http(s):// servers
	function startServers (){
	
		// Start http(s):// server
		app.listen(config.port);
		if (!app.address()) {
			debug.warn('Error detecting app.address().');
			debug.warn(
				'*************',
				'Usually this means you have an instance of Sails, or something else, running on this port.',
				'*************');
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