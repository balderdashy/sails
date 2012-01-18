
var connect = require('./')
  , http = require('http')
  , RedisStore = require('connect-redis')(connect);

var app = connect();
app.use(connect.cookieParser('fucj'));
app.use(connect.session({store:new RedisStore}));
app.use(function(req, res, next){
  req.session.views = (req.session.views || 0) + 1;
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("You've viewed this page "+req.session.views+" times.");
})

http.createServer(app).listen(3000);


// var set = RedisStore.prototype.set;
// 
// function slow(sid){
//   console.log('%s saving', sid);
//   var args = arguments;
//   setTimeout(function(self){
//     console.log('%s saved', sid);
//     set.apply(self, args);
//   }, 2000, this);
// };
// 
// http.createServer(connect()
//   .use(connect.logger('dev'))
//   .use(connect.cookieParser('keyboard cat'))
//   .use(connect.session({ store: new RedisStore }))
//   .use(function(req, res, next){
//     var sess = req.session;
//     switch (req.url) {
//       case '/foo.js':
//         console.log('%s foo.js sid', sess.id);
//         RedisStore.prototype.set = set;
//         res.end('data');
//         break;
//       default:
//         console.log('%s html sid', sess.id);
//         RedisStore.prototype.set = slow;
//         res.setHeader('Content-Type', 'html');
//         res.write('<html><head><script src="/foo.js"></script></head><body>');
//         setTimeout(function(){
//           res.end('</body></html>');
//         }, 1000);
//     }
//   })).listen(3000);
// 
// console.log('port 3000');