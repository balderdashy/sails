var _ = require('@sailshq/lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');









describe('middleware :: ', function() {

  describe('compression :: ', function() {

    // Source text (must be > 1024 bytes to trigger compression)
    var lipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras fringilla mollis sapien sed consequat. Cras vestibulum iaculis rhoncus. Vestibulum et auctor dolor. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc vitae risus sit amet massa lacinia luctus. Quisque auctor hendrerit fermentum. Nullam neque diam, condimentum a nisi eu, ornare porttitor nisl. Praesent porttitor augue turpis, eu consectetur ligula suscipit eget. Aliquam placerat turpis ut varius vestibulum. Pellentesque ligula velit, molestie vel purus sollicitudin, elementum rutrum odio. Ut ultricies convallis leo. Integer id nisl vel tellus laoreet iaculis sed et ipsum. In malesuada sem vitae porttitor sollicitudin. Maecenas sodales est eu augue auctor, in accumsan dolor lacinia. Proin at euismod nibh, eu congue velit. Vestibulum risus velit, vulputate in dui in, commodo sodales elit. Curabitur consectetur justo tincidunt odio imperdiet blandit. Etiam gravida eu ante commodo viverra. Ut sed dapibus purus, eu vulputate neque. Maecenas suscipit felis ac sapien iaculis tempor. Etiam quis vulputate turpis. Cras at nulla lectus. Vestibulum non magna sem. Aliquam tristique lacinia ligula, non interdum justo scelerisque vitae. Praesent molestie eu nibh vel volutpat. Pellentesque ut lacus a tortor lacinia condimentum. Quisque blandit facilisis nunc sed tempus. Praesent dapibus leo at enim mollis, tristique facilisis turpis aliquam. Vestibulum tempus felis ac arcu rhoncus, in efficitur elit sodales. Suspendisse eu odio odio. Vestibulum tempus elementum massa, et rutrum risus ultricies ut. Ut ac mattis nulla. Aenean tristique sollicitudin metus. Morbi massa purus, hendrerit non placerat non, imperdiet nec turpis. Nulla et ultrices metus. Nulla eget congue urna, ut rutrum enim. Aenean rutrum dui massa, non luctus urna dignissim vel. Morbi a suscipit ligula. Nunc laoreet nisi eleifend tortor volutpat finibus vel nec risus. Fusce maximus non sem vel mattis. Etiam iaculis, turpis at sollicitudin blandit, massa mi finibus nunc, nec auctor ex nisl sed.';


    describe('In the production environment', function() {

      // Lift a Sails instance in production mode
      var app = Sails();
      var originalNodeEnv;

      before(function() {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
      });

      after(function() {
        process.env.NODE_ENV = originalNodeEnv;
      });

      before(function (done){
        app.lift({
          globals: false,
          port: 1535,
          environment: 'production',
          log: {level: 'silent'},
          hooks: {session: false, grunt: false, pubsub: false, sockets: false},
          routes: {
            '/test': function(req, res) {
              return res.send(lipsum);
            }
          }
        }, done);
      });


      it('responses should be compressed', function(done) {
        var rawLen = 0, res = '';
        request(
          {
            method: 'GET',
            uri: 'http://localhost:1535/test',
            gzip: true
          }
        )
        .on('data', function(data) {
          // decompressed data as it is received
          res += data;
        })
        .on('response', function(response) {
          // unmodified http.IncomingMessage object
          response.on('data', function(data) {
            rawLen += data.length;
          });
        })
        .on('end', function(err) {
          if (err) {return done(err);}
          assert.equal(res, lipsum);
          assert(rawLen < lipsum.length, 'Expected length of raw response data (' + rawLen.toString() + ') to be < length of source data (' + lipsum.length.toString() + ').');
          return done(err);
        });

      });

      after(function(done) {
        app.lower(done);
      });

    });

    describe('In the development environment', function() {

      // Lift a Sails instance in production mode
      var app = Sails();
      before(function (done){
        app.lift({
          globals: false,
          port: 1535,
          environment: 'development',
          log: {level: 'silent'},
          hooks: {session: false, grunt: false},
          routes: {
            '/test': function(req, res) {
              res.send(lipsum);
            }
          }
        }, done);
      });


      it('responses should not be compressed', function(done) {
        var rawLen = 0, res = '';
        request(
          {
            method: 'GET',
            uri: 'http://localhost:1535/test',
            gzip: true
          }
        )
        .on('data', function(data) {
          // decompressed data as it is received
          res += data;
        })
        .on('response', function(response) {
          // unmodified http.IncomingMessage object
          response.on('data', function(data) {
            rawLen += data.length;
          });
        })
        .on('end', function(err) {
          if (err) {return done(err);}
          assert.equal(res, lipsum);
          assert.equal(rawLen, lipsum.length, 'Expected length of raw response data (' + rawLen.toString() + ') to be equal to length of source data (' + lipsum.length.toString() + ').');
          return done(err);
        });

      });

      after(function(done) {
        app.lower(done);
      });

    });

  });

});
