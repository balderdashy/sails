/**
 * Module dependencies
 */

var rc = require('../lib/app/configuration/rc');


/**
 * require('sails/accessible/rc')
 *
 * A direct reference to Sails' built-in `rc` dependency.
 *
 * > This should not be modified.
 * > It's job is to eliminate the need for an extra `rc` dep. in userland
 * > just to load cmdline config in app.js.
 *
 * @type {Ref}
 */
module.exports = rc;
