var _ = require('@sailshq/lodash');
var chalk = require('chalk');
var portfinder = require('portfinder');
portfinder.basePort = 2001;

var SHOW_VERBOSE_BENCHMARK_REPORT = _.any(process.argv, function(arg) {
  return arg.match(/-v/);
});

if (process.env.BENCHMARK) {

  describe('benchmarks', function() {

    describe('sails.load()', function() {
      before(setupBenchmarks);
      after(reportBenchmarks);


      //
      // Instantiate
      //

      benchmark('require("sails")', function(cb) {
        var Sails = require('../../lib/app');
        var sails = new Sails();
        return cb();
      });


      //
      // Load
      //

      benchmark('sails.load  [first time, no hooks]', function(cb) {
        var Sails = require('../../lib/app');
        var sails = new Sails();
        sails.load({
          log: {
            level: 'error'
          },
          globals: false,
          loadHooks: []
        }, _getTestCleanupCallback(sails, cb));
      });

      benchmark('sails.load  [again, no hooks]', function(cb) {
        this.expected = 25;
        this.comment = 'faster b/c of require cache';

        var Sails = require('../../lib/app');
        var sails = new Sails();
        sails.load({
          log: {
            level: 'error'
          },
          globals: false,
          loadHooks: []
        }, _getTestCleanupCallback(sails, cb));
      });

      benchmark('sails.load  [with moduleloader hook]', function(cb) {
        this.expected = 25;
        this.comment = 'faster b/c of require cache';

        var Sails = require('../../lib/app');
        var sails = new Sails();

        sails.load({
          log: {
            level: 'error'
          },
          globals: false,
          loadHooks: ['moduleloader']
        }, _getTestCleanupCallback(sails, cb));

      });

      benchmark('sails.load  [all core hooks]', function(cb) {
        this.expected = 3000;

        var Sails = require('../../lib/app');
        var sails = new Sails();
        sails.load({
          log: {
            level: 'error'
          },
          globals: false
        }, _getTestCleanupCallback(sails, cb));
      });

      benchmark('sails.load  [again, all core hooks]', function(cb) {
        this.expected = 3000;

        var Sails = require('../../lib/app');
        var sails = new Sails();
        sails.load({
          log: {
            level: 'error'
          },
          globals: false
        }, _getTestCleanupCallback(sails, cb));
      });


      //
      // Lift
      //

      benchmark('sails.lift  [w/ a hot require cache]', function(cb) {
        this.expected = 3000;

        var Sails = require('../../lib/app');
        var sails = new Sails();
        portfinder.getPort(function(err, port) {
          if (err) { throw err; }

          sails.lift({
            log: {
              level: 'error'
            },
            port: port,
            globals: false
          }, _getTestCleanupCallback(sails, cb));
        });
      });

      benchmark('sails.lift  [again, w/ a hot require cache]', function(cb) {
        this.expected = 3000;

        var Sails = require('../../lib/app');
        var sails = new Sails();
        portfinder.getPort(function(err, port) {
          if (err) { throw err; }

          sails.lift({
            log: {
              level: 'error'
            },
            port: port,
            globals: false
          }, _getTestCleanupCallback(sails, cb));
        });
      });

    });


  });


  /**
   * Run the specified function, capturing time elapsed.
   *
   * @param  {[type]}   description [description]
   * @param  {Function} fn          [description]
   * @param  {Function} afterwards
   */
  function benchmark(description, fn) {

    it(description, function (cb) {
      var self = this;

      var t1 = process.hrtime();

      fn.apply(self, [
        function _callbackFromFn(err) {
          var _result = {};

          // If a `comment` or `expected` was provided, harvest it
          _result.expected = self.expected;
          self.expected = null;

          _result.comment = self.comment;
          self.comment = null;

          var diff = process.hrtime(t1);

          _.result.duration = (diff[0] * 1e6) + (diff[1] / 1e3);
          _result.benchmark = description;

          // console.log('finished ',_result);
          self.benchmarks.push(_result);

          if (err) {
            return cb(err);
          }

          return cb.apply(Array.prototype.slice.call(arguments));
       }
      ]);
    });//</it>
  }


  /**
   * Use in mocha's `before`
   *
   * @this {Array} benchmarks
   */
  function setupBenchmarks() {
    this.benchmarks = [];
  }


  /**
   * Use in mocha's `after`
   *
   * @this {Array} benchmarks
   */
  function reportBenchmarks() {
    var output = '\n\nBenchmark Report ::\n';
    output += _.reduce(this.benchmarks, function(memo, result) {

      // Convert to ms-
      var ms = (result.duration / 1000.0);

      // round to 0 decimal places
      function _roundDecimalTo(num, numPlaces) {
        return +(Math.round(num + ('e+' + numPlaces)) + ('e-' + numPlaces));
      }
      ms = _roundDecimalTo(ms, 2);


      var expected = result.expected || 1000;

      // threshold: the "failure" threshold
      var threshold = result.expected;

      var color =
        (ms < 1 * expected / 10) ? 'green' :
        (ms < 3 * expected / 10) ? 'green' :
        (ms < 6 * expected / 10) ? 'cyan' :
        (ms < threshold) ? 'yellow' :
        'red';

      ms += 'ms';
      ms = ms[color];

      // Whether to show expected ms
      var showExpected = true; // ms >= threshold;

      return memo + '\n ' +
        chalk.grey((result.benchmark + '') + ' :: ') + ms +

        // Expected ms provided, and the test took quite a while
        chalk.grey(result.expected && showExpected ? '\n   (expected ' + expected + 'ms' +
          (result.comment ? ' --' + result.comment : '') +
          ')' :

          // Comment provided - but no expected ms
          (result.comment ? '\n   (' + result.comment + ')\n' : '')
        );
    }, '');

    // Log output (optional)
    if (SHOW_VERBOSE_BENCHMARK_REPORT) {
      console.log(output);
    }
  }




  /**
   *
   * @param  {Function} cb [description]
   * @return {Function}
   */
  function _getTestCleanupCallback(app, cb) {
    return function afterLoadingSails (err) {
      if(err) {
        return cb(new Error('Failed with error: '+err.stack));
      }
      app.lower(function (errLowering){
        if (errLowering) {
          return cb(new Error('Everything was otherwise ok, but failed to `.lower()` app. Details:' + errLowering.stack));
        }
        if (err) { return cb(err); }
        return cb();
      });
    };
  }

}
