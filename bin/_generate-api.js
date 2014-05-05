/**
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var sailsgen = require('sails-generate');
var util = require('util');


/**
 *
 * Run both the controller and model generators and add in a couple
 * of extra log messages.
 *
 * TODO: Pull this out into a simple generator
 * @param  {[type]}   scope [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */

module.exports = function generateAPI(scope, cb) {

  console.log();

  // Create the controller and model
  async.parallel(_.map(['controller', 'model'], subGen), function(err) {

    // As long as there were no errors, add some logs about how to call the new API
    if (!err) {
      console.log();
      cb.log.info('REST API generated @ ' + ('http://localhost:1337/' + scope.args[0]).underline);
      cb.log.info('and will be available the next time you run `sails lift`.');
    }
  });

  // Create a function suitable for use with async.parallel to run a generator.
  // Uses "cb.log" b/c it has that nice log format.
  function subGen(generatorType) {
    var _scope = _.extend({}, _.cloneDeep(scope), {
      generatorType: generatorType
    });
    return function(_cb) {
      sailsgen(_scope, {
        success: function() {

          // console.log(scope);

          // Infer the `outputPath` if necessary/possible.
          if (!_scope.outputPath && _scope.filename && _scope.destDir) {
            _scope.outputPath = _scope.destDir + _scope.filename;
          }

          // Humanize the output path
          var humanizedPath;
          if (_scope.outputPath) {
            humanizedPath = ' at ' + _scope.outputPath;
          }
          else if (_scope.destDir) {
            humanizedPath = ' in ' + _scope.destDir;
          }
          else {
            humanizedPath = '';
          }

          // Humanize the module identity
          var humanizedId;
          if (_scope.id) {
            humanizedId = util.format(' ("%s")',_scope.id);
          }
          else humanizedId = '';

          cb.log.info(util.format(
            'Created a new %s%s%s!',
            _scope.generatorType, humanizedId, humanizedPath
          ));
          return _cb();
        },
        error: function(err) {
          cb.error(err);
          return _cb(err);
        },
        invalid: 'error'
      });
    };
  }
};
