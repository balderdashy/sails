/**
 * Module dependencies
 */
var _ = require('@sailshq/lodash');
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

// We're only interested in env vars prefixed with `sails_`.
var prefix = 'sails_';
// Cache the prefix length so we don't have to keep looking it up.
var l = prefix.length;

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

    // Override the current value at this keypath in `conf` (which currently contains
    // the string value of the env var) with the now (possibly) humanized value.
    _.set(conf, keypath, val);

  }

});

// Load command line arguments, since they need to take precedence over env.
var argv = minimist(process.argv.slice(2));

// Merge the command line arguments back on top.
conf = _.merge(conf, argv);

// Expose the final conf object to the world.
module.exports = conf;
