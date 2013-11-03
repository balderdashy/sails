/**
 * app.js
 *
 * Use `app.js` to run your app in environments where `sails lift` is not available.
 * To start the server, run: `node app.js`.
 *
 * The same command-line arguments as sails lift are also supported,
 * e.g.: `node app.js --silent --port=80 --prod`
 */
require('sails').lift(require('optimist').argv);
