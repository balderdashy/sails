var assert = require('assert');
var Sails = require('../../lib/app');

describe('sails being lifted and lowered (e.g in a test framework)', function() {

    for (var i = 0; i < 15; ++i) {

        describe('Test suite ' + i, function() {
            var sailsServer = null;

            before(function (done) {
                assert.doesNotThrow(function() {
                    Sails().lift({
                        port: 1342,
                        environment: process.env.TEST_ENV,
                        log: {
                            level: 'error'
                        },
                        globals: false,
                        hooks: {
                            grunt: false,
                        }
                    }, function (err, sails) {
                        sailsServer = sails;
                        return done(err);
                    });
                });
            });

            after(function (done) {
                sailsServer.lower(function (err) {
                    sailsServer = null;
                    done(err);
                });
            });

            it('run a test', function (done) {
                assert(sailsServer);
                done();
            });

        });
    }
});
