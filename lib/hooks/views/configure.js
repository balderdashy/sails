/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var _ = require('lodash');


/**
 * Marshal relevant parts of sails global configuration,
 * issue deprecation notices, etc.
 *
 * @param  {Sails} sails
 */
module.exports = function configure ( sails ) {

  if (sails.config.views.engine) {
    sails.log.warn('The `config.views.engine` config has been deprecated. ' +
                   'In Sails 1.x, use `config.views.extension` to choose your view extension (defaults to ".ejs"),\n' +
                   'and use `config.views.getRenderFn` to configure your template engine (or leave undefined to use\n' +
                   'the built-in EJS template support.');
    sails.config.views.extension = sails.config.views.engine.ext || 'ejs';
    delete sails.config.views.engine;
  }


  // Let user know that a leading . is not required in the viewEngine option and then fix it
  if (sails.config.views.extension[0] === '.') {
    sails.log.warn('A leading `.` is not required in the config.views.extension option.  Removing it for you...');
    sails.config.views.extension = sails.config.views.extension.substr(1);
  }

  if (!_.isUndefined(sails.config.views.getRenderFn) && !_.isFunction(sails.config.views.getRenderFn)) {
    sails.log.error('Ignoring invalid `config.views.getRenderFn` setting (expected a function, but got: ' + util.inspect(sails.config.views.getRenderFn));
    delete sails.config.views.getRenderFn;
  }

  else if (sails.config.views.getRenderFn) {
    var renderFn = sails.config.views.getRenderFn();
    if (!_.isFunction(renderFn)) {
      sails.log.error('Ignoring invalid value returned from calling `config.views.getRenderFn` (expected a function, but got: ' + util.inspect(renderFn));
      return;
    }
    sails.hooks.views._renderFn = renderFn;

    if (sails.config.views.layout) {
      sails.log.warn('Ignoring `sails.config.views.layout`...');
      sails.log.warn('Sails\' built-in layout support only works with the default EJS view engine.');
      sails.log.warn('You\'re using a custom view engine, so you\'ll need to implement layouts on your own!');
    }

  }

  else {
    // Custom layout location
    // (if string specified, it's used as the relative path from the views folder)
    // (if not string, but truthy, relative path from views folder defaults to ./layout.*)
    // (if falsy, don't use layout)
    if ( !_.isString(sails.config.views.layout) && sails.config.views.layout ) {
      sails.config.views.layout = 'layout.' + sails.config.views.extension;
    }
  }

};
