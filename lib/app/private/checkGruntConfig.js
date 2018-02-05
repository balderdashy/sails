/**
 * Module dependencies
 */
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var _ = require('@sailshq/lodash');

var GRUNT_FILE_HASHES = [
  // v0.10.x - v0.12.x
  'LC+ibPOKSr+pnfsUCCqCN6QobNQ=',
  'Koim03Z2n89h3BxknLlFfO1rTMQ=',
  '1gm6DioH6w1qsObN8Riopf98TLE=',
  'GwpKmvwrsJNW83hN3DTWdo3cmgM=',
  '/Fuc2veAiInWAYLHSFFG7CZb1fY=',
  'sbGaQEjDsJUaoxBt75vU51k/XAQ=',
  'nbNGVMWlWgGp+6w5/hpOctqb3Zg=',
  '0mC0iC9vKOn1ZsZD3PIXRbiVpeE=',
  'uvunqwrU4favfaTz+r+jj9HrCBo=',
  'oyQisk4tEr2xmoL0agollwB47BQ=',
  'CENhG5uQtyYchMfsSR1hrXip2n8=',
  'r8sSfwQd2H5rvWHlOqGVJvVV2fM=',
  'gU+eObj1p6i/fBxFMmnT71rD9nY=',
  'px4a1ssydoV0oPaS9jUIQcJENQY=',
  'VSBY7VlgZQFWjwZnqIuoGqSnUGE=',
  'Wlt+xKwDUMonGwG7Nft9CTzELR0=',
  'Z0E2pGVhvZ9W4xxnmwZ+fl5v4eM=',
  'rwg3LZZpX4NCaKXyZrwLCXwA7do=',
  'n0Rgeh72CLkgowuiEnD8kXN1BjU=',
  '54FhWGvi0cGKWqPcC8lGZObeyDE=',
  'lMUqRINbKUqt7dlYpUfFbbaKUec=',
  '3c4GtS51hOeJgCrzwEnieoRQl+Y=',
  'yQF6e3lJEQL1rfcMTzaQfYuHmiY=',
  '73gW9Db+T+auwjCC1pKy2i5EuLM=',
  'bi7qfWlEwCvkWNq2tBByU+UMlrM=',
  'aNXJ8DfeOsAcwdZlDos85/STc1g=',
  'eLMtNcLVGJj8Ybw3LS2bgHO/I2o=',
  // v1.0
  'H7L2crM/z2r0M0UiHqsagAoDsT0=',
];

module.exports = function(sails) {

  return function(results, cb) {

    // If the Grunt hook is explicitly turned off, don't worry about this check.
    if (sails.config.hooks.grunt === false) {
      return cb();
    }

    // Load this app's package.json and dependencies
    var appPackageJSON;
    try {
      appPackageJSON = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json')));
    } catch (unusedErr) {
      // If there's an error loading the package.json, just ignore it.
      // This is indicative of a bigger issue that will likely be dealt with elsewhere,
      // and is not the responsibility of the "check for Grunt hook" code.
      return cb();
    }

    // If this app has sails-hook-grunt installed, then we're all good.
    if (
      (appPackageJSON.dependencies && appPackageJSON.dependencies['sails-hook-grunt']) ||
      (appPackageJSON.devDependencies && appPackageJSON.devDependencies['sails-hook-grunt'])
    ) {
      return cb();
    }

    // Attempt to hash the contents of this app's Gruntfile.js (if it has one).
    var hash = (function() {
      try {
        var Gruntfile = fs.readFileSync(path.resolve(process.cwd(), 'Gruntfile.js'));
        return crypto.createHash('sha1').update(Gruntfile).digest('base64');
      } catch (unusedErr) {
        return null;
      }
    })();//ˆ

    // If we didn't get a hash, it's probably because the Gruntfile doesn't exist.
    // If that's the case, then there's nothing to worry about (Grunt won't run),
    // and if there was some other error, that's weird but not something we need to
    // deal with in this advisory warning code.
    if (!hash) {
      return cb();
    }

    // Check the hash against known Gruntfiles, and if it matches either, log the warning.
    // Otherwise, it means the file's been customized, and we'll just trust that the user
    // knows what they're doing.
    if (_.contains(GRUNT_FILE_HASHES, hash)) {
      sails.log.debug('Warning: Grunt functionality may not work properly with your current configuration.');
      sails.log.debug('Run `npm install sails-hook-grunt --save` to continue using Grunt with your app.');
      sails.log.debug();
    }

    return cb();

  };

};
