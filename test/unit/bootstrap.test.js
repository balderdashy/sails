/**
 * Module dependencies
 */

var assert = require('assert');

var Sails = require('root-require')('lib/app');


describe('bootstrap', function (){

  it('should return the expected error when something throws', function (done) {

    var ERROR = 'oh no I forgot my keys';
    var bootstrapWasFired;

    Sails().lift({
      globals: false,
      loadHooks: false,
      bootstrap: function (cb) {
        bootstrapWasFired = true;
        cb(ERROR);
      }
    }, function (err) {
      if (!bootstrapWasFired) return done(new Error('Should have called the bootstrap function'));
      if (!err) {
        return done(new Error('Should have passed an error to the callback of sails.lift()'));
      }
      if (err) {
        return done();
      }
    });
  });

  it('should return an error if the bootstrap\'s callback is called twice', function (done) {
    done();
  });
});
