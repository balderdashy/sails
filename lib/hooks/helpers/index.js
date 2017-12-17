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
      packInfo = packInfo || {};
      slug = _.map(slug.split('.'), _.kebabCase).join('.');
      // console.log(`furnishPack('${slug}', …)`);
      var slugKeyPath = _.map(slug.split('.'), _.camelCase).join('.');
      var chunks = slugKeyPath.split('.');

      if (chunks.length > 1) {
        sails.log.verbose(
          'Watch out!  Nesting helpers more than one sub-folder deep can be a liability.  '+
          'It also means that you\'ll need to type more every time you want to use '+
          'your helper.  Instead, try keeping your directory structure as flat as possible; '+
          'i.e. in general, having more explicit filenames is better than having deep, '+
          'complicated folder hierarchies.'
        );
      }

      // If pack already exists, avast.
      if (_.get(sails.helpers, slugKeyPath)) {
        return;
      }

      // console.log('chunks',chunks);
      // Ancestor packs:
      var thisKeyPath;
      var theseChunks;
      var parentKeyPath;
      var parentPackOrRoot;
      for (var i = 0; i < chunks.length - 1; i++) {
        theseChunks = chunks.slice(0,i+1);
        thisKeyPath = theseChunks.join('.');
        parentKeyPath = theseChunks.slice(0, -1).join('.');
        // console.log('i+1',i+1, 'thisKeyPath',thisKeyPath);
        if (!_.get(sails.helpers, thisKeyPath)) {
          parentPackOrRoot = parentKeyPath ? _.get(sails.helpers, parentKeyPath) : sails.helpers;
          parentPackOrRoot[chunks[i]] = machine.pack({
            name: 'sails.helpers.'+chunks.slice(0,i+1).join('.'),
            defs: {}
          });
          // console.log('[ancestral packs] at `sails.helpers.'+thisKeyPath+'`, attached:', parentPackOrRoot[chunks[i]]);
        }
      }//∞

      // Main pack:
      parentKeyPath = chunks.slice(0, -1).join('.');
      parentPackOrRoot = parentKeyPath ? _.get(sails.helpers, parentKeyPath) : sails.helpers;
      parentPackOrRoot[chunks[chunks.length - 1]] = machine.pack(_.extend({}, packInfo, {
        name: 'sails.helpers.'+slugKeyPath
      }));
      // console.log('parentpackOrRoot:', parentPackOrRoot);
      // console.log('[main pack] at `sails.helpers.'+slugKeyPath+'`, attached:', parentPackOrRoot[chunks.length - 1]);
    },

    furnishHelper: function(identityPlusMaybeSlug, nmDef){

      // Ensure we're starting off with dot-delimited, kebab-cased hops.
      identityPlusMaybeSlug = _.map(identityPlusMaybeSlug.split('.'), _.kebabCase).join('.');
      // console.log(`furnishHelper('${identityPlusMaybeSlug}', …)`);

      var chunks = identityPlusMaybeSlug.split('.');

      // slug ('foo-bar.baz-bing.beep.boop')
      // identity ('do-something')
      var slug = chunks.length >= 2 ? chunks.slice(0, -1).join('.') : undefined;
      var identity = _.last(chunks);

      // Camel-case every part of the file path, and join with dots
      // e.g. admin-stuff.foo.do-something => adminStuff.foo.doSomething
      var slugKeyPath = slug ? _.map(slug.split('.'), _.camelCase).join('.') : undefined;
      var fullKeyPath = slug ? slugKeyPath + '.' + machine.getMethodName(identity) : machine.getMethodName(identity);
      // console.log('slugKeyPath',slugKeyPath);
      // console.log('fullKeyPath',fullKeyPath);

      if (!_.get(sails.helpers, fullKeyPath)) {

        // Work our way down
        if (slug && !_.get(sails.helpers, slugKeyPath)) {
          this.furnishPack(slug, {
            name: 'sails.helpers.'+slugKeyPath,
            defs: {}
            // defs: (function(){
            //   var defs = {};
            //   defs[identity] = nmDef;
            //   return defs;
            // })()//†
          });
        }//ﬁ

        // And then build the helper last
        // > (can't do it first!  We'd confuse `_.get()`!)

        // Use provided `identity` if no explicit identity was set.
        // (Otherwise, as of machine@v15, this could fail with an ImplementationError.)
        if (!nmDef.identity) {
          nmDef.identity = identity;
        }

        // Attach new method to the appropriate pack.
        // e.g. sails.helpers.userHelpers.foo.myHelper
        if (slug) {
          var parentPack = _.get(sails.helpers, slugKeyPath);
          // console.log('SLUG:',slug);
          // console.log('attaching new method (`'+identity+'`) to pack at `sails.helpers.'+slugKeyPath+'`:', parentPack);
          // console.log('[helper method] attaching at `sails.helpers.'+fullKeyPath+'`.');
          parentPack.registerDefs(
            (function(){
              var defs = {};
              defs[identity] = nmDef;
              return defs;
            })()//†
          );
        } else {
          // console.log('[top-lvl helper method] attaching at `sails.helpers.'+identity+'`.');
          sails.helpers[machine.getMethodName(identity)] = machine.build(nmDef);
        }

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
