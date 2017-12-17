/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var machine = require('machine');

// TODO: pass in the helpers


/**
 * buildInspectFnForSailsHelpers()
 *
 * Get an override for the inspect function for `sails.helpers`,
 * with language/examples that vary slightly depending on the
 * provided custom usage opts.
 *
 * @param  {Dictionary?} customUsageOpts
 * @return {Function}
 */
module.exports = function buildInspectFnForSailsHelpers(customUsageOpts){

  var opts = _.extend({}, DEFAULT_CUSTOM_USAGE_OPTS, customUsageOpts || {});
  // TODO^^

  // Async example:
  var example1 = (function(){
    var exampleArginPhrase = '';
    if (opts.arginStyle === 'named') {
      exampleArginPhrase = '{dir: \'./colorado/\'}';
    } else if (opts.arginStyle === 'serial') {
      exampleArginPhrase = '\'./colorado/\'';
    }

    return 'var contents = await sails.helpers.fs.ls('+exampleArginPhrase+');';
  })();//†

  // Synchronous example:
  var example2 = (function(){
    var exampleArginPhrase = '';
    if (opts.arginStyle === 'named') {
      exampleArginPhrase = '{style: \'url-friendly\'}';
    } else if (opts.arginStyle === 'serial') {
      exampleArginPhrase = '\'url-friendly\'';
    }

    if (opts.execStyle === 'deferred') {
      return 'var name = sails.helpers.strings.random('+exampleArginPhrase+').now();';
    } else if (opts.execStyle === 'immediate' || opts.execStyle === 'natural') {
      return 'var name = sails.helpers.strings.random('+exampleArginPhrase+');';
    }
    throw new Error('Consistency violation: Unrecognized usage opts.  (This should never happen, since it should have already been validated and prevented from being built- please report at https://sailsjs.com/bugs)');
  })();//†


  // Tree diagram:
  var treeDiagram = (function(){

    // For reference:
    // ```
    // '   ├── flow\n'+
    // '   │   ├── simultaneously\n'+
    // '   │   └── until\n'+
    // '   │\n'+
    // '   └── stripe\n'+
    // '       ├── retrieveCustomerDetails\n'+
    // '       └── updateCustomer';
    // ```
    var A_ = '   ├── ';
    var CA = '   │   ├── ';
    var CB = '   │   └── ';
    var C_ = '   │';
    var B_ = '   └── ';
    var _A = '       ├── ';
    var _B = '       └── ';

    return ''+
    '   .\n'+
    _.reduce(_.keys(LIBRARY_CONTENTS), function(memo, pgName, packIdx){

      var isLastPack = (packIdx === _.keys(LIBRARY_CONTENTS).length - 1);
      if (isLastPack) {
        memo += B_ + pgName + '\n';
      } else {
        memo += A_ + pgName + '\n';
      }

      var pgInfo = LIBRARY_CONTENTS[pgName];
      memo += _.reduce(pgInfo.methodIdts, function(memo, identity, methodIdx){
        var isLastMethod = (methodIdx === pgInfo.methodIdts.length - 1);
        var methodName = machine.getMethodName(identity);
        if (isLastMethod && isLastPack) {
          memo += _B + methodName;
        } else if (isLastMethod) {
          memo += CB + methodName + '\n';
          memo += C_ + '\n';
        } else if (isLastPack) {
          memo += _A + methodName + '\n';
        } else {
          memo += CA + methodName + '\n';
        }
        return memo;
      }, '');//∞
      return memo;
    }, '');//∞

  })();//†

  return function inspect(){
    return ''+
    '-------------------------------------------------------\n'+
    ' sails.helpers\n'+
    '\n'+
    ' Available methods:\n'+
    treeDiagram+'\n'+
    '\n'+
    '\n'+
    ' Example usage:\n'+
    '   '+example1+'\n'+
    '   '+example2+'\n'+
    '\n'+
    ' More info:\n'+
    '   https://sailsjs.com/support\n'+
    '-------------------------------------------------------\n';
  };//ƒ
};
