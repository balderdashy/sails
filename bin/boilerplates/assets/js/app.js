/**
 * socketio_example.js
 *
 * This file contains some example browser-side JavaScript for connecting 
 * to your Sails backend using Socket.io.
 *
 * It is designed to get you up and running fast, but it's just an example.
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */



// Immediately start connecting
socket = io.connect();

typeof console !== 'undefined' && 
console.log('Connecting Socket.io to Sails.js...');

// Attach a listener which fires when a connection is established:
socket.on('connect', function socketConnected() {

  typeof console !== 'undefined' && 
  console.log(
    'Socket is now connected and globally accessible as `socket`.\n' +
    'e.g. to send a GET request to Sails via Socket.io, try: \n' +
    '`socket.get("/foo", function (response) { console.log(response); })`'
  );
  
  // Attach a listener which fires every time the server publishes a message:
  socket.on('message', function newMessageFromSails ( message ) {

    typeof console !== 'undefined' && 
    console.log('New message received from Sails ::\n', message);

  });
});



// NOTE
//
// This example expects and/or creates the following global variables:
//
// (1)  `io`
//
//    For this example to work, the socket.io client (`socket.io.js`) must 
//    be included on your page BEFORE this file.  This is because we need
//    access to the global `io` variable.
//
//    To see an example, just check out this app.  `sails new` bundles a copy
//    of the socket.io client in `assets/socket.io.js`, and the default Gruntfile 
//    includes it in the proper order before this file.
//
//
// (2)  `socket`
//
//    In this example, after we finish connecting to the server, we expose the
//    connected `socket` as a global-- mainly because this makes it easy to access
//    from the browser console.
//
//    Check it out!
//
//    > socket.get('/parrot',      console.log.bind(console));
//    > socket.get('/parrot/3',      console.log.bind(console));
//    > socket.post('/parrot', { name: 'Polly', age: 49 },      console.log.bind(console) );
//    > socket.put('/parrot/4', { age: 50 },      console.log.bind(console) );
//    > socket.delete('/parrot/3',      console.log.bind(console) );
//
// 
//    BTW in case you were wondering:       `console.log.bind(console)`
//    is just a Chrome-friendly shortcut for:   `function (response) {console.log(response); }`


