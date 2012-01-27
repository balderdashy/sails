
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/')
  , router = require('./router')
  , db = require('./model')
  , fs = require('fs')
  , config = require('./config');

// Bootstrap and sync database
db.bootstrap();

/*
var app = module.exports = express.createServer({
    key: fs.readFileSync('ssl/private.key.pem'),
    cert: fs.readFileSync('ssl/combined.crt')
});
*/
var app = module.exports = express.createServer();


// Configuration

// Enable JSONP
app.enable("jsonp callback");

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
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

// Routes
app.get('/', routes.index);
app.get('/read*', router.read);
app.get('/load*', router.load);

app.listen(config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
