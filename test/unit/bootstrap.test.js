/**
 * Module dependencies
 */

var assert = require('assert');

var Sails = require('root-require')('lib/app');


describe('bootstrap', function (){

  it('should return the expected error when something throws', function (done) {

    var ERROR = 'oh no I forgot my keys';

    var firedBootstrap = false;

    var sails = Sails();
    sails.lift({
      globals: false,
      loadHooks: [ 'moduleloader', 'userconfig' ],
      bootstrap: function (cb) {
        firedBootstrap = true;
        cb('oops');
      }
    }, function (err) {
      if (!firedBootstrap) return done(new Error('Should have called the bootstrap function'));
      if (!err) {
        return done(new Error('Should have passed an error to the callback of sails.load()'));
      }
      if (err) {
        return done();
      }
    });
  });

});
