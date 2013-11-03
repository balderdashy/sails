/**
 * app.js
 *
 * Use `app.js` to run your app in environments where `sails lift` is not available.
 * To start the server, run: `node app.js`.
 *
 * The same command-line arguments as sails lift are also supported,
 * e.g.: `node app.js --silent --port=80 --prod`
 */

// Ensure a "sails" can be located:
var sails;
try {
	sails = require('sails');
}
catch (e) {
	console.error('To run an app using `node app.js`, you usually need to have a version of `sails` installed in the same directory as your app.');
	console.error('You might run `npm install sails` to install sails in this directory.');
	console.error('');
	console.error('Alternatively, if you have sails installed globally (i.e. you did `npm install -g sails`), you can use `sails lift`.');
	console.error('When you run `sails lift`, your app will still use a local `./node_modules/sails` dependency if it exists,');
	console.error('but if it doesn\'t, the app will run with the global sails instead!');
}

// Start server
sails.lift(require('optimist').argv);
