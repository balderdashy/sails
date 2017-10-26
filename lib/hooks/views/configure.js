/**
 * Module dependencies
 */

var util = require('util');
var flaverr = require('flaverr');
var _ = require('@sailshq/lodash');


/**
 * Marshal relevant parts of sails global configuration,
 * issue deprecation notices, etc.
 *
 * @param  {Sails} sails
 */
module.exports = function configure ( sails ) {

  if (sails.config.views.engine) {
    sails.log.debug('The `config.views.engine` config has been deprecated.');
    sails.log.debug('In Sails 1.x, use `config.views.extension` to choose your view');
    sails.log.debug('extension (defaults to ".ejs"), and use `config.views.getRenderFn`');
    sails.log.debug('to configure your template engine or leave it undefined to use');
    sails.log.debug('the built-in EJS template support.\n');
    sails.config.views.extension = sails.config.views.engine.ext || 'ejs';
    delete sails.config.views.engine;
  }


  // Make sure the extension is valid.
  if (sails.config.views.extension === '' || (!_.isString(sails.config.views.extension) && sails.config.views.extension !== false)) {
    throw flaverr({ name: 'userError', code: 'E_INVALID_VIEW_CONFIG' }, new Error('`sails.config.views.extension` must either be a string or `false`.'));
  }

  // Let user know that a leading . is not required in the viewEngine option and then fix it
  if (sails.config.views.extension[0] === '.') {
    sails.log.warn('A leading `.` is not required in the config.views.extension option.  Removing it for you...');
    sails.config.views.extension = sails.config.views.extension.substr(1);
  }

  // Make sure the `getRenderFn` is valid, if provided.
  if (!_.isUndefined(sails.config.views.getRenderFn) && !_.isFunction(sails.config.views.getRenderFn)) {
    throw flaverr({ name: 'userError', code: 'E_INVALID_VIEW_CONFIG' }, new Error('`sails.config.views.getRenderFn`, if provided, must be a function (got ' + util.inspect(sails.config.views.getRenderFn) + ')'));
  }

  else if (sails.config.views.getRenderFn) {
    var renderFn = sails.config.views.getRenderFn();
    if (!_.isFunction(renderFn)) {
      throw flaverr({ name: 'userError', code: 'E_INVALID_VIEW_CONFIG' }, new Error('`sails.config.views.getRenderFn` returned an invalid value. (expected a function, but got: ' + util.inspect(renderFn) + ')'));
    }
    sails.hooks.views._renderFn = renderFn;

    if (sails.config.views.layout) {
      sails.log.error('Ignoring `sails.config.views.layout`...');
      sails.log.error('Sails\' built-in layout support only works with the default EJS view engine.');
      sails.log.error('You\'re using a custom view engine, so you\'ll need to implement layouts on your own!');
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
