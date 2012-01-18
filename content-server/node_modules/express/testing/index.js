
/**
 * Module dependencies.
 */

var express = require('../')
  , http = require('http')
  , connect = require('connect');

var app = express.createServer();

app.get('/', function(req, res){
  req.foo();
  res.send('test');
});

// app.set('views', __dirname + '/views');
// app.set('view engine', 'jade');
// 
// app.configure(function(){
//   app.use(function(req, res, next){
//     debugger
//     res.write('first');
//     console.error('first');
//     next();
//   });
// 
//   app.use(app.router);
// 
//   app.use(function(req, res, next){
//     console.error('last');
//     res.end('last');
//   });
// });
// 
// app.get('/', function(req, res, next){
//   console.error('middle');
//   res.write(' route ');
//   next();
// });

app.listen(3000);
console.log('listening on port 3000');