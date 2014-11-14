/**
 * Module dependencies.
 */
var async   = require('async');
var _       = require('lodash');
var figures = require('figures');


/**
 * Sails.prototype.lift()
 *
 * Loads the app, then starts all attached servers.
 *
 * @api public
 */
module.exports = function lift(configOverride, cb) {
  var sails = this;

  // try {console.timeEnd('require_core');}catch(e){}

  // try {console.time('core_lift');}catch(e){}

  // Callback is optional
  cb = cb || function(err) {
    if (err) return sails.log.error(err);
  };

  async.series([

    function(cb) {
      sails.load(configOverride, cb);
    },

    sails.initialize

  ], function sailsReady(err, async_data) {
    if (err) {
      return sails.lower(function (errorLoweringSails){

        cb(err);

        if (errorLoweringSails) {
          sails.log.error('When trying to lower the app as a result of a failed lift, encountered an error:',errorLoweringSails);
        }
      });
    }

    _printSuccessMsg(sails);

    // try {console.timeEnd('core_lift');}catch(e){}

    sails.emit('lifted');
    sails.isLifted = true;
    return cb(null, sails);
  });
};

function _printLoaderMsg(text, path){
  sails.log.blank();
  sails.log(text);
  _.forEach(path, function(item){
    sails.log("\t" + item + " " + figures.tick);
  });
}

function _getStaticPath(appPath, publicPath){
  var size = appPath.length;
  return publicPath.substring(size);
}

// Gather app meta-info and log startup message (the boat).
function _printSuccessMsg(sails) {

  // If `config.noShip` is set, skip the startup message.
  if (!(sails.config.log && sails.config.log.noShip)) {

    sails.log.ship && sails.log.ship();
    sails.log.info(('Server lifted in `' + sails.config.appPath + '`'));
    sails.log.info(('Statics files in `' + _getStaticPath(sails.config.appPath, sails.config.paths.public) + '`'));
    sails.log.info(('To see your app, visit ' + (sails.getBaseurl() || '').underline));
    sails.log.info(('To shut down Sails, press <CTRL> + C at any time.'));
    sails.log.blank();
    sails.log('--------------------------------------------------------'.grey);
    sails.log((':: ' + new Date()).grey);
    sails.log.blank();
    sails.log('Environment    : ' + sails.config.environment);

    // Only log the host if an explicit host is set
    if (sails.getHost()) {
      sails.log('Host          : ' + sails.getHost()); // 12 - 4 = 8 spaces
    }
    sails.log('Port           : ' + sails.config.port); // 12 - 4 = 8 spaces
    if (!sails.modules.isEmpty()) _printLoaderMsg("Modules loaded :", sails.modules.availables());
    sails.log('--------------------------------------------------------'.grey);

  }
}
