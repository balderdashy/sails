/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var _ = require('@sailshq/lodash');
var consolidate = require('consolidate');


/**
 * Marshal relevant parts of sails global configuration,
 * issue deprecation notices, etc.
 *
 * @param  {Sails} sails
 */
module.exports = function configure ( sails ) {

  if (sails.config.viewEngine) {
    sails.log.warn('The `config.viewEngine` config has been deprecated in favor of `config.views.engine`.');
    sails.log.warn('It has been automatically migrated, but you\'ll continue to see this warning until you change your configuration files.');
    sails.config.views.engine = sails.config.viewEngine;
  }

  // Normalize view engine config and allow defining a custom extension
  if (_.isString(sails.config.views.engine)) {
    var viewExt = sails.config.views.extension || sails.config.views.engine;
    sails.config.views.engine = {
      name: sails.config.views.engine,
      ext: viewExt
    };
  }

  // Get the view engine name
  var engineName = sails.config.views.engine.name || sails.config.views.engine.ext;

  // Ensure valid config
  if (! (sails.config.views.engine && sails.config.views.engine.ext) ) {
    sails.log.error('Invalid view engine configuration. `config.views.engine` should');
    sails.log.error('be set to either a `string` or an `object` with the following properties:');
    sails.log.error('    {');
    sails.log.error('        ext: <string>,   // the file extension');
    sails.log.error('        fn: <function>   // the template engine render function');
    sails.log.error('    }');
    sails.log.error('For example: {ext:"html", fn: require("consolidate").swig}');
    sails.log.error('For details: http://expressjs.com/api.html#app.engine');
    throw new Error('Invalid view engine configuration.');
  }

  // Try to load view module if a function wasn't specified directly
  if ( !sails.config.views.engine.fn ) {

    var appDependenciesPath;
    var fn;

    appDependenciesPath = path.join(sails.config.appPath, 'node_modules');

    try {

      // Try to load the view engine, optionally using a separate module
      // (see https://github.com/tj/consolidate.js/blob/master/lib/consolidate.js#L568)
      fn = getEngine(appDependenciesPath,engineName,sails.config.views.engine.module, sails);

      // If the engine doesn't export a function, it's not consolidate-compatible
      if ( !_.isFunction(fn) ) {
        sails.log.error(util.format('Invalid view engine (%s)-- are you sure it supports `consolidate`?', engineName));
        throw new Error();
      }
    }

    // If the engine can't be loaded, we can't continue
    catch (e) {
      sails.log.error('Your configured server-side view engine (' + engineName + ') could not be found.');
      sails.log.error('Usually, this just means you need to install a dependency.');
      sails.log.error('To install ' + engineName + ', try running:  `npm install ' + engineName + ' --save`');
      sails.log.error('Otherwise, please change your `engine` configuration in config/views.js.');
      throw e;
    }

    // Save reference to view rendering function
    // munge callback to protect against https://github.com/tj/consolidate.js/issues/143
    sails.config.views.engine.fn = function (str, options, cb) {
      fn(str, options, function (e, result) { setImmediate(function () { cb(e, result); }); });
    }
    sails.log.silly('Configured view engine, `' + engineName + '`');
  }

  // Let user know that a leading . is not required in the viewEngine option and then fix it
  if (sails.config.views.engine.ext[0] === '.') {
    sails.log.warn('A leading `.` is not required in the views.engine option.  Removing it for you...');
    sails.config.views.engine.ext = sails.config.views.engine.ext.substr(1);
  }

  // Custom layout location
  // (if string specified, it's used as the relative path from the views folder)
  // (if not string, but truthy, relative path from views folder defaults to ./layout.*)
  // (if falsy, don't use layout)
  if ( !_.isString(sails.config.views.layout) && sails.config.views.layout ) {
    sails.config.views.layout = 'layout.' + sails.config.views.engine.ext;
  }

  var layoutableEngines = [
    'ejs',
    'handlebars',
    'ractive'
  ];
  if ( sails.config.views.layout && layoutableEngines.indexOf(engineName) < 0 ) {
    sails.log.warn('Sails\' built-in layout support only works with the `' +
      layoutableEngines.join('`, `') + '` view engines.');
    sails.log.warn('You\'re using `'+ engineName +'`.');
    sails.log.warn('Ignoring `sails.config.views.layout`...');
  }
};



// Load a view engine either from the Consolidate cache or from a module installed
// locally to the Sails app.
function getEngine(appDependenciesPath, engineName, moduleName, sails) {

  // Most of the time the module name and engine name are the same
  moduleName = moduleName || engineName;

  // Get the base template loading function from consolidate
  var fn = consolidate[engineName];

  // If we haven't cached the engine module in consolidate's requires cache, do it now.
  if(!consolidate.requires[moduleName]) {
    try {
      //ensure the engine is required relative to the path of our app
      consolidate.requires[moduleName] = require(appDependenciesPath+'/' + moduleName);
      // If the engine name and module names are different, cache the engine under both
      // keys, since Consolidate likes it both ways:
      // https://github.com/tj/consolidate.js/blob/master/lib/consolidate.js#L195
      // https://github.com/tj/consolidate.js/blob/master/lib/consolidate.js#L568
      if (engineName !== moduleName) {
        consolidate.requires[engineName] = consolidate.requires[moduleName];
      }
    } catch(e) {
      sails.log.info('Could not find module:', moduleName , 'in path:', appDependenciesPath);
    }
  }

  return fn;
}
