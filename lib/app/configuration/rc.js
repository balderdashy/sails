/**
 * Module dependencies
 */

var rc = require('rc');


/**
 * Locate and load a .sailsrc file if one exists.
 *
 * NOTE: this occurs almost immediately when sails is required,
 * and since `rc` is synchronous, the examination of env variables,
 * cmdline opts, and .sailsrc files is immediate, and happens only once.
 *
 * @type {Object}
 */
module.exports = rc('sails');
