// Module Dependencies
express = require('express');
fs = require('fs');
async = require('async');
Sequelize = require("sequelize");
_ = require('underscore');
db = require('./config/db');
config = require('./config/app');


// Bootstrap and sync database
db.bootstrap();

// Create global objects for models
// TODO: automatically grab all models from models directory
Content = require("./models/Content").model;
Collection = require("./models/Collection").model;

// Trigger associations
Content.options.associate();
Collection.options.associate();




/*
var app = module.exports = express.createServer({
    key: fs.readFileSync('ssl/private.key.pem'),
    cert: fs.readFileSync('ssl/combined.crt')
});
*/
var app = module.exports = express.createServer();


// Map Routes
// API
(apiRouter = require('./apiRouter')).mapUrls(app);

// CMS
(cmsRouter = require('./cmsRouter')).mapUrls(app);



// Configuration
// Enable JSONP
app.enable("jsonp callback");

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler());
});



// Start server
app.listen(config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
