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
parseCookie = require('connect').utils.parseCookie;
ConnectSession = require('connect').middleware.session.Session;



// Set up logger
debug = require('./lib/logger.js').debug;

// Configuration
db = require('./config/db'); 
config = require('./config/app');
require('./config/log');


// Run common.js for quick app-wide logic additions
require('./lib/common.js');

// Import model library
require('./lib/model.js');

// Setup sequelize
db.initialize();

// automatically grab all models from models directory
// (if no 'id' attribute was provided, take a guess)
// CASE INSENSITIVE
global.modelNames = [];
_.each(require('require-all')({
	dirname: __dirname + '/models'
	,  filter: /(.+)\.js$/
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

// HTTP
app = module.exports = express.createServer();

// Configuration
// Enable JSONP
app.enable("jsonp callback");

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express['static'](__dirname + '/public'));
  
  
  
	// Session / cookie support
	app.use(express.cookieParser());
	app.use(express.session({
		secret: "k3yboard kat"
		, store: sessionStore
		, key: 'sails.sid'
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
	dirname: __dirname + '/services'
	, 
	filter: /(.+)\.js$/
}),function (service, filename) {
	var serviceName = filename;
	global[serviceName] = service;
});


// Listen for websocket connections (and rejects) through socket.io
io = require('socket.io').listen(app);
 

// Map Routes
// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
(router = require('./lib/router'));
router.mapExpressRequests(app);
router.mapSocketRequests(app,io);


// Start server
app.listen(config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Compile components
var compiler = require('./lib/compiler');


// Attach authorization middleware to socket event receiver
io.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['sails.sid'];
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