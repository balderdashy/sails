/**
 * Module dependencies
 */
var _ = require('lodash');
var rc = require('rc');
var rttc = require('rttc');

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
  var env = process.env;
  var prefix = 'sails_';
  var obj = {};
  var l = prefix.length;
  _.each(_.keys(env), function(k) {
    if((k.indexOf(prefix)) === 0) {

      var keypath = k.substring(l).split('__');

      // Trim empty strings from keypath array
      var _emptyStringIndex;
      while ((_emptyStringIndex=keypath.indexOf('')) > -1) {
        keypath.splice(_emptyStringIndex, 1);
      }

      var cursor = obj;
      _.each(keypath, function _buildSubObj(_subkey,i){

        // (check for _subkey first so we ignore empty strings)
        if (!_subkey) {
          return;
        }

        // If this is the last key, just stuff the value in there
        // Assigns actual value from env variable to final key
        // (unless it's just an empty string- in that case use the last valid key)
        if (i === keypath.length-1){
          try {
            cursor[_subkey] = rttc.parseHuman(env[k], 'json');
          } catch(e) {
            cursor[_subkey] = rttc.parseHuman(env[k]);
          }
        }


        // Build sub-object if nothing already exists at the keypath
        if (cursor[_subkey] === undefined){
          cursor[_subkey] = {};
        }

        // Increment cursor used to track the object at the current depth
        cursor = cursor[_subkey];

      });

    }

  });
  return obj;
})();

// Merge the humanized environment vars into the config we loaded via `rc`.
conf = _.merge(conf, env);

// Expose the final conf object to the world.
module.exports = conf;
