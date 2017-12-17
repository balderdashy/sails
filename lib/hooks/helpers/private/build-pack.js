/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var machine = require('machine');
var DEFAULT_CUSTOM_USAGE_OPTS = require('./private/DEFAULT_CUSTOM_USAGE_OPTS');
var getInspectFn = require('./private/get-inspect-fn');
var LIBRARY_CONTENTS = require('./private/LIBRARY_CONTENTS');
var OUR_PACKAGE_JSON = require('../package.json');

// TODO: finish adapting this file in general

// TODO: use
//arginStyle: 'serial',
// execStyle: 'natural'


/**
 * Module state
 */

// Cache already-packed pgs.
var packedPgsBySlug = {};

/**
 * sails-stdlib
 *
 * Load a package from the standard library.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param {String} slug
 *        The unique shorthand slug for a package. This is almost the same thing as
 *        the normal project slug (e.g. `machinepack-math`), just without the prefix
 *        (e.g. `math`).  Note that this is case insensitive-- whatever gets passed
 *        in is casted to lowercase before being used to look up the appropriate
 *        package.
 *
 * @param {Dictionary?} overrides
 *        Overrides for base custom usage opts.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @return {Dictionary}
 *         The machinepack instance for the specified package.
 */
module.exports = function loadSailsStdlibPg (slug, overrides){

  var opts = _.extend({}, DEFAULT_CUSTOM_USAGE_OPTS, overrides || {});

  slug = slug.toLowerCase();

  // If pg is not already cached, pack it.
  if (!packedPgsBySlug[slug]) {

    switch (slug) {

      // for...
      // Things Defined In Dependencies
      case 'strings':
      case 'fs':
      case 'http':
      case 'process':
        packedPgsBySlug[slug] = (function _buildingTrimmedCopyOfDependencyPack(){
          var dry = require('machinepack-'+slug).toJSON();
          return machine.pack(_.extend(_.clone(dry), {
            name: 'stdlib(\''+slug+'\')',
            defs: _.pick(dry.defs, LIBRARY_CONTENTS[slug].methodIdts)
          }));
        })();//•
        break;

      // for...
      // Things Defined In This Repo
      case 'flow':
      case 'gravatar':
      case 'passwords':
      case 'mailgun':
      case 'stripe':
        packedPgsBySlug[slug] = machine.pack({
          name: 'stdlib(\''+slug+'\')',
          description: LIBRARY_CONTENTS[slug].description,
          defs: _.reduce(LIBRARY_CONTENTS[slug].methodIdts, function(memo, identity){
            memo[identity] = require('./private/'+slug+'/'+identity);
            return memo;
          }, {})
        });
        break;

      // for...
      // Miscreants
      default:
        throw new Error('Unrecognized package slug: `'+slug+'`.  Please choose from the list of packages listed at https://npmjs.com/package/sails-stdlib');
    }
  }

  // Customize with custom usage opts.
  var pg = packedPgsBySlug[slug].customize(opts);

  return pg;

};



/**
 * .customize()
 *
 * Return a customized version of this library with the specified custom usage
 * options applied across the board.
 *
 * @returns {Ref}  [customized library]
 */

Object.defineProperty(module.exports, 'customize', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function customize(baselineCustomUsageOpts){
    var customizedLib = function loadCustomSailsStdlibPg(slug, overrides){
      return module.exports(slug, _.extend({}, DEFAULT_CUSTOM_USAGE_OPTS, baselineCustomUsageOpts, overrides||{}));
    };//ƒ
    Object.defineProperty(customizedLib, 'inspect', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: getInspectFn(baselineCustomUsageOpts)
    });
    return customizedLib;
  }//ƒ
});


/**
 * .inspect()
 *
 * Return a pretty-printed explanation of what this is, for use in the REPL, etc.
 *
 * > Note: This overrides Node's default console.log() / util.inspect() behavior.
 *
 * @returns {String}
 */

Object.defineProperty(module.exports, 'inspect', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: getInspectFn()
});


/**
 * .VERSION
 *
 * Expose the current version of this library.
 *
 * @type {String}
 */

Object.defineProperty(module.exports, 'VERSION', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: OUR_PACKAGE_JSON.version
});
