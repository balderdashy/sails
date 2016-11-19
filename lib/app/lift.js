/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('@sailshq/lodash');
var chalk = require('chalk');

/**
 * Sails.prototype.lift()
 *
 * Loads the app, then starts all attached servers.
 *
 * @api public
 */

module.exports = function lift(configOverride, cb) {
  var sails = this;

  // configOverride is optional
  if (_.isFunction(configOverride)) {
    cb = configOverride;
    configOverride = {};
  }

  // Callback is optional
  cb = cb || function(err) {
    if (err) return sails.log.error(err);
  };

  async.series([

    function(cb) {
      sails.load(configOverride, cb);
    },

    sails.initialize

  ], function sailsReady(err, async_data) { //TODO: unused variable async_data
    if (err) {
      return sails.lower(function (errorLoweringSails){
        if (errorLoweringSails) {
          sails.log.error('When trying to lower the app as a result of a failed lift, encountered an error:',errorLoweringSails);
        }
        cb(err);
      });
    }

    _printSuccessMsg(sails);

    // try {console.timeEnd('core_lift');}catch(e){}

    sails.emit('lifted');
    sails.isLifted = true;
    return cb(null, sails);
  });
};



// Gather app meta-info and log startup message (the boat).
function _printSuccessMsg(sails) {

  // If `config.noShip` is set, skip the startup message.
  if (!(sails.config.log && sails.config.log.noShip)) {

    sails.log.ship && sails.log.ship();
    sails.log.info(('Server lifted in `' + sails.config.appPath + '`'));
    sails.log.info(chalk.underline('To see your app, visit ' + (sails._getBaseUrl() || '')));
    sails.log.info(('To shut down Sails, press <CTRL> + C at any time.'));
    sails.log.blank();
    sails.log(chalk.grey(Array(56).join('-')));
    sails.log(chalk.grey(':: ' + new Date()));
    sails.log.blank();
    sails.log('Environment : ' + sails.config.environment);

    // Only log the host if an explicit host is set
    if (sails.getHost()) {
      sails.log('Host        : ' + sails.getHost()); // 12 - 4 = 8 spaces
    }
    sails.log('Port        : ' + sails.config.port); // 12 - 4 = 8 spaces
    sails.log(chalk.grey(Array(56).join('-')));
  }
}
