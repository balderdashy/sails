/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var machine = require('machine');
var loadHelpers = require('./private/load-helpers');


/**
 * Helpers hook
 */

module.exports = function(sails) {

  return {


    defaults: {
      helpers: {
        moduleDefinitions: undefined,// « can be set to a dictionary of helpers (experimental)
      }
    },


    configure: function() {

      // Define `sails.helpers` here so that it can potentially be used by other hooks.
      // > NOTE: This is NOT `sails.config.helpers`-- this is `sails.helpers`!
      // > (As for sails.config.helpers, it's set automatically based on our `defaults above)
      sails.helpers = {};

    },


    initialize: function(done) {

      // Load helpers from the appropriate folder.
      loadHelpers(sails, done);

    },

    furnishPack: function(slug, packInfo){
      slug = _.map(slug.split('.'), _.kebabCase).join('.');
      var slugKeyPath = _.map(slug.split('.'), _.camelCase).join('.');

      if (_.get(sails.helpers, slugKeyPath)) {
        return false;
      } else {
        // Ancestor packs:
        var chunks = slugKeyPath.split('.');
        // console.log('chunks',chunks);
        var thisKeyPath;
        for (var i = 0; i < chunks.length; i++) {
          thisKeyPath = chunks.slice(0,i+1).join('.');
          // console.log('i+1',i+1, 'thisKeyPath',thisKeyPath);
          if (!_.get(sails.helpers, thisKeyPath)) {
            _.set(sails.helpers, thisKeyPath, machine.pack({
              name: 'sails.helpers.'+chunks.slice(0,i+1).join('.'),
              defs: {}
            }));
          }
        }//∞

        // Main pack:
        _.set(sails.helpers, slugKeyPath, machine.pack(_.extend({}, packInfo, {
          name: 'sails.helpers.'+slugKeyPath
        })));

        return true;
      }//ﬁ
    },

    furnishHelper: function(identityPlusMaybeSlug, nmDef){
      var chunks = identityPlusMaybeSlug.split('.');
      // if (chunks.length > 2) {
      //   throw new Error('Too much nesting: furnishHelper() currently only supports one level of nesting for helpers.');
      // }

      // slug ('foo-bar.baz-bing.beep.boop')
      // identity ('do-something')
      var slug = chunks.length >= 2 ? _.map(chunks.slice(0, -1), _.kebabCase).join('.') : undefined;
      var identity = _.kebabCase(_.last(chunks));

      // Camel-case every part of the file path, and join with dots
      // e.g. admin-stuff.foo.do-something => adminStuff.foo.doSomething
      var slugKeyPath = slug ? _.map(slug.split('.'), _.camelCase).join('.') : undefined;
      var fullKeyPath = slug ? slugKeyPath + '.' + machine.getMethodName(identity) : machine.getMethodName(identity);

      // Work our way down
      if (slug && !_.get(sails.helpers, slugKeyPath)) {
        this.furnishPack(slug, {
          name: 'sails.helpers.'+slugKeyPath,
          defs: {
            [identity]: nmDef//todo
          }
        });
      }//ﬁ

      // And build the helper last
      // > (can't do it first!  We'd confuse `_.get()`!)
      if (!_.get(sails.helpers, fullKeyPath)) {

        // Use provided `identity` if no explicit identity was set.
        // (Otherwise, as of machine@v15, this could fail with an ImplementationError.)
        if (!nmDef.identity) {
          nmDef.identity = identity;
        }

        // Use _.set to set the (possibly nested) property of sails.helpers
        // e.g. sails.helpers.userHelpers.foo.myHelper
        _.set(sails.helpers, fullKeyPath, machine.build(nmDef));
      }//ﬁ


    },


    /**
     * sails.hooks.helpers.reload()
     *
     * @param  {Dictionary?}   helpers [if specified, these helpers will replace all existing helpers.  Otherwise, if omitted, helpers will be freshly reloaded from disk, and old helpers will be thrown away.]
     * @param  {Function} done    [optional callback]
     *
     * @experimental
     */
    reload: function(helpers, done) {

      // Handle variadic usage
      if (typeof helpers === 'function') {
        done = helpers;
        helpers = undefined;
      }

      // Handle optional callback
      done = done || function _noopCb(err){
        if (err) {
          sails.log.error('Could not reload helpers due to an error:', err, '\n(continuing anyway...)');
        }
      };//ƒ

      // If we received an explicit set of helpers to load, use them.
      // Otherwise reload helpers from the appropriate folder.
      if (helpers) {
        sails.helpers = helpers;
        return done();
      } else {
        return loadHelpers(sails, done);
      }
    }//ƒ


  };

};
