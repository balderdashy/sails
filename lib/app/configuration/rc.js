/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var minimist = require('minimist');
var rc = require('rc');
var rttc = require('rttc');


/**
 * Load configuration from .rc files and env vars
 * @param  {string} namespace Namespace to look for env vars under (defaults to `sails`)
 * @return {dictionary} A dictionary of config values gathered from .rc files, with env vars and command line options merged on top
 */

module.exports = function(namespace) {

  // Default namespace to `sails`.
  namespace = namespace || 'sails';

  // Locate and load .rc files if they exist.
  var conf = rc(namespace);

  // Load in overrides from the environment, using `rttc.parseHuman` to
  // guesstimate the types.
  // NOTE -- the code below is lifted from the `rc` module, and modified to:
  //  1. Pass JSHint
  //  2. Run parseHuman on values
  // If at some point `rc` exposes metadata about which configs came from
  // the environment, we can simplify our code by just running `parseHuman`
  // on those values instead of doing the work to pluck them from the env.

  // Construct the expected env var prefix from the namespace.
  var prefix = namespace + '_';

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
      catch(unusedErr) {
        val = rttc.parseHuman(val);
      }

      // Override the current value at this keypath in `conf` (which currently contains
      // the string value of the env var) with the now (possibly) humanized value.
      _.set(conf, keypath, val);

    }

  });

  // Load command line arguments, since they need to take precedence over env.
  var argv = minimist(process.argv.slice(2));

  // Merge the command line arguments back on top.  Minimist allows nested config (i.e. --log.level=silly),
  // hence the _.merge().
  conf = _.merge(conf, argv);

  return conf;

};
