var Benchmark = require('benchmark');
var _ = require('@sailshq/lodash');

/**
 * benchmarx()
 * ---------------------------
 * @param  {String}   name
 * @param  {Array}   testFns  [array of functions]
 * @param  {Function}   notifier
 * @param  {Function} done
 */
module.exports = function benchmarx (name, testFns, done) {
  Benchmark.options.minSamples = 500;
  var suite = new Benchmark.Suite({ name: name });
  _.each(testFns, function (testFn) {
    suite = suite.add(testFn.name, {
      defer: true,
      fn: function (deferred) {
        testFn(function _afterRunningTestFn(err){
          process.nextTick(function _afterEnsuringAsynchronous(){
            if (err) {
              console.error('An error occured when attempting to benchmark this code:\n',err);
              // Resolve the deferred either way.
            }

            deferred.resolve();
          });//</afterwards cb from waiting for nextTick>
        });//</afterwards cb from running test fn>
      }
    });//<suite.add>
  });//</each testFn>

  suite.on('cycle', function(event) {
    console.log(' •',String(event.target), '(avg ' + (event.target.stats.mean * 1000) + ' ms)');
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    console.log('Slowest is ' + this.filter('slowest').map('name'));
    return done(undefined, this);
  })
  .run();
};
