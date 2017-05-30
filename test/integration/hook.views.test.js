/**
 * Test dependencies
 */

var util = require('util');
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var _ = require('@sailshq/lodash');
var Filesystem = require('machinepack-fs');
var tmp = require('tmp');

var Sails = require('../../lib').constructor;

tmp.setGracefulCleanup();




describe('hooks :: ', function() {

  describe('views hook', function() {

    var curDir, tmpDir, sailsApp;
    var sailsConfig = {};
    var filesToWrite = {};

    afterEach(function(done) {
      sailsApp.lower(function() {
        process.chdir(curDir);
        return done();
      });
    });

    beforeEach(function(done) {
      // Cache the current working directory.
      curDir = process.cwd();
      // Create a temp directory.
      tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);
      // Write a layout file for each test.
      Filesystem.writeSync({
        force: true,
        destination: 'views/layout.ejs',
        string: '<!DOCTYPE html><html><head><!-- default layout --></head><body><%- body %></body></html>'
      }).execSync();
      // Write out any files specific to this test.
      _.each(filesToWrite, function(data, filename) {
        Filesystem.writeSync({
          force: true,
          destination: filename,
          string: data
        }).execSync();
      });
      // Merge the default config with any config specific to this test.
      var _config = _.merge({
        port: 1342,
        hooks: {grunt: false, blueprints: false, policies: false, pubsub: false},
        log: {level: 'error'},
      }, sailsConfig);
      // Lift Sails for this test.
      (new Sails()).lift(_config, function(err, _sails) {
          sailsApp = _sails;
          return done(err);
        }
      );
    });

    afterEach(function(done) {
      sailsApp.lower(function() {
        process.chdir(curDir);
        return done();
      });
    });


    describe('using res.view', function () {

      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/resView': function(req, res) {
              return res.view('homepage');
            }
          }
        };
        filesToWrite = {
          'views/homepage.ejs': '<!-- Default home page -->'
        };
      });

      it('should respond to a get request to localhost:1342 with the requested page wrapped in the default layout', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body><!-- Default home page --></body></html>');
          done();
        });
      });

    });

    describe('using res.view with i18n', function () {

      before(function() {
        sailsConfig = {

          // We must set i18n.locales because otherwise, the hook will be skipped.
          i18n: { locales: ['en', 'es'] },

          routes: {
            '/resView': function(req, res) {
              return res.view('homepage');
            }
          }

        };
        filesToWrite = {
          'views/homepage.ejs': '<%= __(\'Welcome\') + i18n(\'Welcome\') %>',
          'config/locales/es.json': '{"Welcome":"Bienvenido"}'
        };
      });

      it('should respond to a get request to localhost:1342 with the requested page wrapped in the default layout', function(done) {

        httpHelper.testRoute(
          'get',
          {url: 'resView', headers: {'accept-language': 'es'}},
          function(err, response) {
            if (err) {
              return done(err);
            }

            if (response.statusCode !== 200) {
              return done(new Error('Should have gotten 200 status code, but instead got '+response.statusCode+' with a response body of: '+util.inspect(response.body, {depth:null})+''));
            }

            try {
              assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body>BienvenidoBienvenido</body></html>');
            } catch (e) { return done(e); }

            done();
          });
      });

    });

    describe('using exposeLocalsToBrowser', function () {

      describe('with CSRF enabled', function() {

        before(function() {
          sailsConfig = {
            hooks: {i18n: false},
            security: {
              csrf: true
            },
            routes: {
              '/expose-locals': function(req, res) {
                return res.view('show-locals', {foo: 'bar', abc: 123});
              }
            }
          };
          filesToWrite = {
            'views/show-locals.ejs': '<%- exposeLocalsToBrowser() %>',
          };
        });

        it('should respond to a get request to localhost:1342 with a page containing a script exposing locals, including a csrf token', function(done) {

          httpHelper.testRoute('get', 'expose-locals', function(err, response) {
            if (err) {
              return done(new Error(err));
            }
            assert(response.body.indexOf('foo: unescape(\'bar\')') > -1);
            assert(response.body.indexOf('abc: unescape(123)') > -1);
            assert(response.body.indexOf('_csrf: unescape') > -1);
            done();
          });
        });

      });

      describe('with CSRF disabled', function() {

        before(function() {
          sailsConfig = {
            hooks: {i18n: false},
            routes: {
              '/expose-locals': function(req, res) {
                return res.view('show-locals', {foo: 'bar', abc: 123});
              }
            }
          };
          filesToWrite = {
            'views/show-locals.ejs': '<%- exposeLocalsToBrowser() %>',
          };
        });

        it('should respond to a get request to localhost:1342 with a page containing a script exposing locals, including a csrf token', function(done) {

          httpHelper.testRoute('get', 'expose-locals', function(err, response) {
            if (err) {
              return done(new Error(err));
            }
            assert(response.body.indexOf('foo: unescape(\'bar\')') > -1);
            assert(response.body.indexOf('abc: unescape(123)') > -1);
            assert(response.body.indexOf('_csrf: unescape') < 0);
            done();
          });
        });


      });
    });

    describe('using res.view with `sails.config.views.layout = false`', function () {

      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/resView': function(req, res) {
              return res.view('homepage');
            }
          },
          views: {
            layout: false
          }
        };
        filesToWrite = {
          'views/homepage.ejs': '<!-- Default home page -->'
        };
      });

      it('should respond to a get request to localhost:1342 with the requested page NOT wrapped in the default layout', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<!-- Default home page -->');
          done();
        });
      });

    });


    describe('using res.view with {layout: false} in locals', function () {

      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/resView': function(req, res) {
              return res.view('homepage', {layout: false});
            }
          }
        };
        filesToWrite = {
          'views/homepage.ejs': '<!-- Default home page -->'
        };
      });

      it('should respond to a get request to localhost:1342 with the requested page NOT wrapped in the default layout', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<!-- Default home page -->');
          done();
        });
      });

    });

    describe('using res.view with an alternate layout', function () {

      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/resView': function(req, res) {
              return res.view('homepage', {layout: 'alt-layout'});
            },
          }
        };
        filesToWrite = {
          'views/homepage.ejs': '<!-- Default home page -->',
          'views/alt-layout.ejs': '<FOO><%-body%></FOO>',
        };
      });

      it('should respond to a get request to localhost:1342 with the requested page wrapped in the alternate layout', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<FOO><!-- Default home page --></FOO>');
          done();
        });
      });

    });

    describe('using res.view with an alternate extension for EJS', function () {
      var nunjucks = require('nunjucks');
      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/resView': function(req, res) {
              return res.view('homepage', {boss: 'llama'});
            },
          },
          views: {
            extension: 'foo',
          }
        };
        filesToWrite = {
          'views/layout.foo': '<!DOCTYPE html><html><head><!-- default layout --></head><body><%- body %></body></html>',
          'views/homepage.foo': '<!-- vars like a <%= boss %> -->',
        };
      });

      it('should respond to a get request to localhost:1342 with the correct content', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body><!-- vars like a llama --></body></html>');
          done();
        });
      });

    });

    describe('using res.view with an alternate render fn', function () {
      var nunjucks = require('nunjucks');
      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/resView': function(req, res) {
              return res.view('homepage', {boss: 'dinosaur'});
            },
          },
          views: {
            layout: false,
            extension: 'html',
            getRenderFn: function() {
              var env = nunjucks.configure({
                tags: {
                  variableStart: '<$',
                  variableEnd: '$>',
                }
              });
              return env.render.bind(env);
            }
          }
        };
        filesToWrite = {
          'views/homepage.html': '<!-- vars like a <$ boss $> -->',
        };
      });

      it('should respond to a get request to localhost:1342 with the correct content', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<!-- vars like a dinosaur -->');
          done();
        });
      });

    });


    describe('using partials', function () {

      describe('with cacheing turned off', function() {

        before(function() {
          sailsConfig = {
            hooks: {i18n: false},
            routes: {
              '/partials': function(req, res) {
                return res.view('test-partials');
              },
            }
          };
          filesToWrite = {
            'views/test-partials.ejs': '<BLAP><%- partial(\'./partials/outer.ejs\') %></BLAP>',
            'views/partials/outer.ejs': '<FOO><%- partial(\'./nested/inner.ejs\') %></FOO>',
            'views/partials/nested/inner.ejs': '<BAR>BAZ!</BAR>'
          };
        });

        it('should respond to a get request to localhost:1342 with the correct content, and respond differently to a subsequent request after changing the file contents', function(done) {

          httpHelper.testRoute('get', 'partials', function(err, response) {
            if (err) {
              return done(new Error(err));
            }
            assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body><BLAP><FOO><BAR>BAZ!</BAR></FOO></BLAP></body></html>');
            filesToWrite = {
              'views/layout.ejs': '<ZAP><%- body %></ZAP>',
              'views/test-partials.ejs': '<APPLE><%- partial(\'./partials/outer.ejs\') %></APPLE>',
              'views/partials/outer.ejs': '<ORANGE><%- partial(\'./nested/inner.ejs\') %></ORANGE>',
              'views/partials/nested/inner.ejs': '<BANANA>TADA!</BANANA>'
            };
            _.each(filesToWrite, function(data, filename) {
              Filesystem.writeSync({
                force: true,
                destination: filename,
                string: data
              }).execSync();
            });
            httpHelper.testRoute('get', 'partials', function(err, response) {
              if (err) {
                return done(new Error(err));
              }
              assert.equal(response.body, '<ZAP><APPLE><ORANGE><BANANA>TADA!</BANANA></ORANGE></APPLE></ZAP>');
              done();
            });
          });
        });

      });

      describe('with cacheing turned on', function() {

        before(function() {
          sailsConfig = {
            hooks: {i18n: false},
            routes: {
              '/partials': function(req, res) {
                return res.view('test-partials', {cache: true});
              },
            }
          };
          filesToWrite = {
            'views/test-partials.ejs': '<BLAP><%- partial(\'./partials/outer.ejs\') %></BLAP>',
            'views/partials/outer.ejs': '<FOO><%- partial(\'./nested/inner.ejs\') %></FOO>',
            'views/partials/nested/inner.ejs': '<BAR>BAZ!</BAR>'
          };
        });

        it('should respond to a get request to localhost:1342 with the correct content, and respond the same way to a subsequent request after changing the file contents', function(done) {

          httpHelper.testRoute('get', 'partials', function(err, response) {
            if (err) {
              return done(new Error(err));
            }
            assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body><BLAP><FOO><BAR>BAZ!</BAR></FOO></BLAP></body></html>');
            filesToWrite = {
              'views/layout.ejs': '<ZAP><%- body %></ZAP>',
              'views/test-partials.ejs': '<APPLE><%- partial(\'./partials/outer.ejs\') %></APPLE>',
              'views/partials/outer.ejs': '<ORANGE><%- partial(\'./nested/inner.ejs\') %></ORANGE>',
              'views/partials/nested/inner.ejs': '<BANANA>TADA!</BANANA>'
            };
            _.each(filesToWrite, function(data, filename) {
              Filesystem.writeSync({
                force: true,
                destination: filename,
                string: data
              }).execSync();
            });
            httpHelper.testRoute('get', 'partials', function(err, response) {
              if (err) {
                return done(new Error(err));
              }
              assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body><BLAP><FOO><BAR>BAZ!</BAR></FOO></BLAP></body></html>');
              done();
            });
          });
        });

      });

    });

    describe('using renderView', function () {

      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/renderView': function(req, res) {
              req._sails.renderView('homepage', {}, function(err, html) {
                return res.send(html);
              });
            }
          }
        };
        filesToWrite = {
          'views/homepage.ejs': '<!-- Default home page -->'
        };
      });

      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', 'renderView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body><!-- Default home page --></body></html>');
          done();
        });
      });

    });

    describe('using renderView (with i18n disabled)', function () {

      before(function() {
        sailsConfig = {
          hooks: {i18n: false},
          routes: {
            '/renderView': function(req, res) {
              req._sails.renderView('homepage', {}, function(err, html) {
                return res.send(html);
              });
            }
          },
          hooks: {
            i18n: false
          }
        };
        filesToWrite = {
          'views/homepage.ejs': '<!-- Default home page -->'
        };
      });

      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', 'renderView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert.equal(response.body, '<!DOCTYPE html><html><head><!-- default layout --></head><body><!-- Default home page --></body></html>');
          done();
        });
      });

    });

  });

});
