var io = require('socket.io');

// Publishing a message somewhere
var pub = redis.createClient();
pub.publish("messages", JSON.stringify({type: "foo", content: "bar"}));

// Socket handler
io.sockets.on("connection", function(socket) {
  var sub = redis.createClient();
  sub.subscribe("messages");
  sub.on("message", function(channel, message) {
    socket.send(message);
  });

  socket.on("disconnect", function() {
    sub.unsubscribe("messages");
    sub.quit();
  });
});