/**
 * Module dependencies
 */
var _ = require('lodash');
var rc = require('rc');
var rttc = require('rttc');
var minimist = require('minimist');

/**
 * Locate and load .sailsrc files if they exist.
 *
 * NOTE: this occurs almost immediately when sails is required,
 * and since `rc` is synchronous, the examination of env variables,
 * cmdline opts, and .sailsrc files is immediate, and happens only once.
 *
 * @type {Object}
 */
var conf = rc('sails');

// Load in overrides from the environment, using `rttc.parseHuman` to
// guesstimate the types.
// NOTE -- the code below is lifted from the `rc` module, and modified to:
//  1. Pass JSHint
//  2. Run parseHuman on values
// If at some point `rc` exposes metadata about which configs came from
// the environment, we can simplify our code by just running `parseHuman`
// on those values instead of doing the work to pluck them from the env.
var env = (function () {

  // We're only interested in env vars prefixed with `sails_`.
  var prefix = 'sails_';
  // Cache the prefix length so we don't have to keep looking it up.
  var l = prefix.length;
  // Declare a var to hold env vars we find.
  var obj = {};

  // Loop through the env vars, looking for ones with the right prefix.
  _.each(process.env, function(val, key) {

    // If this var's name has the right prefix...
    if((key.indexOf(prefix)) === 0) {

      // Replace double-underscores with dots, to work with Lodash _.set().
      var keypath = key.substring(l).replace(/__/g,'.');

      // Attempt to parse the value as JSON.
      try {
        val = rttc.parseHuman(val, 'json');
      }
      // If that doesn't work, humanize the value without providing a schema.
      catch(e) {
        val = rttc.parseHuman(val);
      }

      // Set the value at the path specified by the key.
      _.set(obj, keypath, val);

    }

  });
  return obj;
})();

// Load command line arguments, since they need to take precedence over env.
var argv = minimist(process.argv.slice(2));

// Merge the humanized environment vars into the config we loaded via `rc`.
conf = _.merge(conf, env);

// Merge the command line arguments back on top.
conf = _.merge(conf, argv);

// Expose the final conf object to the world.
module.exports = conf;
