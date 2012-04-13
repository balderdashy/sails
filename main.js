// Module Dependencies
express = require('express');
fs = require('fs');
async = require('async');
Sequelize = require("sequelize");
_ = require('underscore');
db = require('./config/db'); 
config = require('./config/app');
var MemoryStore = express.session.MemoryStore;

// Run common.js
require('./common.js');

// Build session store
sessionStore = new MemoryStore();


// Bootstrap and sync database
db.bootstrap();

// automatically grab all models from models directory
// (if no 'id' attribute was provided, take a guess)
// CASE INSENSITIVE
global.modelNames = [];
_.each(require('require-all')({
	dirname: __dirname + '/models'
	, 
	filter: /(.+)\.js$/
}),function (model, filename) {
	var className = model.id || filename;
	className = className.toCapitalized();
	global.modelNames.push(className);
	global[className] = model.model;
});

// Create domain associations
_.each(modelNames,function (className) {
	global[className].options.associate();
});



// HTTPs
/*
var app = module.exports = express.createServer({
    key: fs.readFileSync('ssl/private.key.pem'),
    cert: fs.readFileSync('ssl/combined.crt')
});
*/

// HTTP
var app = module.exports = express.createServer();

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
		, 
		store: sessionStore
	//		, key: 'express.sid'
	}));
	
	// Set up router
	app.use(app.router);
});

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
app.register('.js', require('ejs'));


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
(router = require('./router')).mapUrls(app);



// Start server
app.listen(config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);