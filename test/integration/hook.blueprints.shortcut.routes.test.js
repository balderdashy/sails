/**
 * Test dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');

var Sails = require('../../lib').constructor;

/**
 * Errors
 */
var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response.body);
  }
};


describe('blueprints :: ', function() {

  var curDir, tmpDir, sailsApp;

  var extraSailsConfig = {};

  describe('shortcut routes :: ', function() {

    beforeEach(function(done) {
      // Cache the current working directory.
      curDir = process.cwd();
      // Create a temp directory.
      tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);
      (new Sails()).load(_.merge({
        hooks: {
          grunt: false, views: false, policies: false
        },
        orm: { moduleDefinitions: { adapters: { 'sails-disk': require('sails-disk')} } },
        models: {
          migrate: 'drop',
          schema: true
        },
        blueprints: {
          rest: false,
          actions: false
        },
        log: {level: 'error'}
      }, extraSailsConfig), function(err, _sails) {
        if (err) { return done(err); }
        sailsApp = _sails;
        return done();
      });
    });

    afterEach(function(done) {
      sailsApp.lower(function() {
        process.chdir(curDir);
        return done();
      });
    });

    describe('basic usage :: ', function() {

      before(function() {
        extraSailsConfig = {
          orm: {
            moduleDefinitions: {
              models: {
                user: {
                  attributes: {
                    name: 'string',
                    pets: {
                      collection: 'pet',
                      via: 'owner'
                    }
                  }
                },
                pet: {
                  attributes: {
                    name: 'string',
                    owner: {
                      model: 'user'
                    }
                  }
                }
              },
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      describe('a get request to /:model/find', function() {

        it('should return JSON for all of the instances of the test model', function(done) {
          sailsApp.models.user.create({name: 'al'}).exec(function(err) {
            if (err) {return done (err);}
            sailsApp.request('get /user/find', function (err, resp, data) {
              assert(!err, err);
              assert.equal(data.length, 1);
              assert.equal(data[0].name, 'al');
              assert.equal(data[0].id, 1);
              done();
            });
          });
        });
      });


      describe('a get request to /:model/find/:id', function() {

        it('should return JSON for the requested instance of the test model', function(done) {
          sailsApp.models.user.create({name: 'ron'}).exec(function(err) {
            if (err) {return done (err);}
            sailsApp.request('get /user/find/1', function (err, resp, data) {
              assert(!err, err);
              assert.equal(data.name, 'ron');
              assert.equal(data.id, 1);
              done();
            });
          });
        });
      });

      describe('a get request to /:model/update/:id?name=foo', function() {

        it('should return JSON for an updated instance of the test model', function(done) {
          sailsApp.models.user.create({name: 'dave'}).exec(function(err) {
            if (err) {return done (err);}
            sailsApp.request('get /user/update/1?name=bob', function (err, resp, data) {
              if (err) {return done (err);}
              assert.equal(data.name, 'bob');
              assert.equal(data.id, 1);
              sailsApp.models.user.findOne({id: 1}).exec(function(err, user) {
                if (err) {return done (err);}
                assert(user);
                assert.equal(user.name, 'bob');
                return done();
              });
            });
          });
        });
      });

      describe('a get request to /:model/create?name=foo', function() {

        it('should return JSON for a newly created instance of the test model', function(done) {
          sailsApp.request('get /user/create?name=joe', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.name, 'joe');
            assert.equal(data.id, 1);
            sailsApp.models.user.findOne({id: 1}).exec(function(err, user) {
              if (err) {return done (err);}
              assert(user);
              assert.equal(user.name, 'joe');
              return done();
            });
          });
        });
      });


      describe('a get request to /:model/destroy/1', function() {

        it('should return JSON for the deleted instance of the test model', function(done) {
          sailsApp.models.user.create({name: 'bubba'}).exec(function(err) {
            if (err) {return done (err);}
            sailsApp.request('get /user/destroy/1', function (err, resp, data) {
              assert(!err, err);
              assert.equal(data.name, 'bubba');
              assert.equal(data.id, 1);
              sailsApp.models.user.findOne({id: 1}).exec(function(err, user) {
                if (err) {return done (err);}
                assert(!user);
                return done();
              });
            });
          });
        });
      });

      describe('associations :: ', function() {

        describe('a get request to /:model/:parentid/:association', function() {

          it('should return JSON for the specified collection of the test model', function(done) {
            sailsApp.models.user.create({name: 'will', pets: [{name: 'spot'}]}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /user/1/pets', function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.length, 1);
                assert.equal(data[0].name, 'spot');
                assert.equal(data[0].id, 1);
                assert.equal(data[0].owner, 1);
                return done();
              });
            });
          });
        });

        describe('a get request to /:model/:parentid/:association/:id', function() {

          it('should return JSON for the specified instance in the collection of the test model', function(done) {
            sailsApp.models.user.create({name: 'roger', pets: [{name: 'bubbles'}, {name: 'dempsey'}]}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /user/1/pets/2', function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.length, 1);
                assert.equal(data[0].name, 'dempsey');
                assert.equal(data[0].id, 2);
                assert.equal(data[0].owner, 1);
                return done();
              });
            });
          });
        });

        describe('a get request to /:model/:parentid/:association/:id', function() {

          it('should return JSON for an instance of the test model, with its collection updated', function(done) {
            sailsApp.models.user.create({name: 'ira'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.models.pet.create({name: 'flipper'}).exec(function(err) {
                if (err) {return done (err);}
                sailsApp.request('get /user/1/pets/add/1', function (err, resp, data) {
                  if (err) {return done (err);}
                  assert.equal(data.name, 'ira');
                  assert.equal(data.id, 1);
                  assert.equal(data.pets.length, 1);
                  assert.equal(data.pets[0].name, 'flipper');
                  sailsApp.models.user.findOne({id: 1}).populate('pets').exec(function(err, user) {
                    if (err) {return done (err);}
                    assert(user);
                    assert.equal(user.name, 'ira');
                    assert.equal(user.id, 1);
                    assert.equal(user.pets.length, 1);
                    assert.equal(user.pets[0].name, 'flipper');
                    return done();
                  });
                });
              });
            });
          });
        });

        describe('a get request to /:model/:parentid/:association/add?id=1 (posting an existing model ID)', function() {

          it('should return JSON for an instance of the test model, with its collection updated', function(done) {
            sailsApp.models.user.create({name: 'ryan'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.models.pet.create({name: 'bubbles'}).exec(function(err) {
                if (err) {return done (err);}
                sailsApp.request('get /user/1/pets/add?id=1', function (err, resp, data) {
                  if (err) {return done (err);}
                  assert.equal(data.name, 'ryan');
                  assert.equal(data.id, 1);
                  assert.equal(data.pets.length, 1);
                  assert.equal(data.pets[0].name, 'bubbles');
                  sailsApp.models.user.findOne({id: 1}).populate('pets').exec(function(err, user) {
                    if (err) {return done (err);}
                    assert(user);
                    assert.equal(user.name, 'ryan');
                    assert.equal(user.id, 1);
                    assert.equal(user.pets.length, 1);
                    assert.equal(user.pets[0].name, 'bubbles');
                    return done();
                  });
                });
              });
            });
          });
        });

        describe('a get request to /:model/:parentid/:association/add (posting a new model)', function() {

          it('should return JSON for an instance of the test model, with its collection updated', function(done) {
            sailsApp.models.user.create({name: 'kevin'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /user/1/pets/add?name=rex', function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.name, 'kevin');
                assert.equal(data.id, 1);
                assert.equal(data.pets.length, 1);
                assert.equal(data.pets[0].name, 'rex');
                sailsApp.models.user.findOne({id: 1}).populate('pets').exec(function(err, user) {
                  if (err) {return done (err);}
                  assert(user);
                  assert.equal(user.name, 'kevin');
                  assert.equal(user.id, 1);
                  assert.equal(user.pets.length, 1);
                  assert.equal(user.pets[0].name, 'rex');
                  return done();
                });
              });
            });
          });
        });

        describe('a get request to /:model/:parentid/:association/remove/:id', function() {

          it('should return JSON for an instance of the test model, with its collection updated', function(done) {
            sailsApp.models.user.create({name: 'larry', pets: [{name: 'alice'}]}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /user/1/pets/remove/1', function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.name, 'larry');
                assert.equal(data.id, 1);
                assert.equal(data.pets.length, 0);
                sailsApp.models.user.findOne({id: 1}).populate('pets').exec(function(err, user) {
                  if (err) {return done (err);}
                  assert(user);
                  assert.equal(user.name, 'larry');
                  assert.equal(user.id, 1);
                  assert.equal(user.pets.length, 0);
                  return done();
                });
              });
            });
          });
        });

        describe('a get request to /:model/:parentid/:association/remove?id=1', function() {

          it('should return JSON for an instance of the test model, with its collection updated', function(done) {
            sailsApp.models.user.create({name: 'gary', pets: [{name: 'wilbur'}]}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /user/1/pets/remove?id=1', function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.name, 'gary');
                assert.equal(data.id, 1);
                assert.equal(data.pets.length, 0);
                sailsApp.models.user.findOne({id: 1}).populate('pets').exec(function(err, user) {
                  if (err) {return done (err);}
                  assert(user);
                  assert.equal(user.name, 'gary');
                  assert.equal(user.id, 1);
                  assert.equal(user.pets.length, 0);
                  return done();
                });
              });
            });
          });
        });

      });

    });

    describe('filtering in the query string :: ', function() {

      before(function() {
        extraSailsConfig = {
          orm: {
            moduleDefinitions: {
              models: {
                user: {
                  attributes: {
                    name: 'string'
                  }
                }
              }
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      it('a get request to /:model/find?name=scott should respond with the correctly filtered instances', function(done) {
        sailsApp.models.user.create([{name: 'scott'}, {name: 'mike'}]).exec(function(err) {
          if (err) {return done(err);}
          sailsApp.request('get /user/find?name=scott', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 1);
            assert.equal(data[0].name, 'scott');
            done();
          });
        });
      });

      it('a get request to /:model/find?where={...} should respond with the correctly filtered instances', function(done) {
        sailsApp.models.user.create([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {        if (err) {return done(err);}
          sailsApp.request('get /user/find?where={"name": {">": "irl"}}', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 3);
            var names = _.pluck(data, 'name');
            assert(_.contains(names, 'scott'));
            assert(_.contains(names, 'mike'));
            assert(_.contains(names, 'rachael'));
            done();
          });
        });
      });


    });

    describe('using sort, skip and limit in the query string :: ', function() {

      before(function() {
        extraSailsConfig = {
          orm: {
            moduleDefinitions: {
              models: {
                user: {
                  attributes: {
                    name: 'string'
                  }
                }
              }
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      it('a get request to /:model/find?sort=name&limit=2&skip=1 should respond with the correctly filtered instances', function(done) {
        sailsApp.models.user.create([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {
          if (err) {return done(err);}
          sailsApp.request('get /user/find?sort=name&limit=2&skip=1', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 2);
            assert.equal(data[0].name, 'irl');
            assert.equal(data[1].name, 'mike');
            done();
          });
        });
      });

      it('a get request to /:model/find?sort=name%20desc&limit=2&skip=1 should respond with the correctly filtered instances', function(done) {
        sailsApp.models.user.create([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {
          if (err) {return done(err);}
          sailsApp.request('get /user/find?sort=name%20desc&limit=2&skip=1', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 2);
            assert.equal(data[0].name, 'rachael');
            assert.equal(data[1].name, 'mike');
            done();
          });
        });
      });

      it('a get request to /:model/find?sort={"name":-1}&limit=2&skip=1 should respond with the correctly filtered instances', function(done) {
        sailsApp.models.user.create([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {
          if (err) {return done(err);}
          sailsApp.request('get /user/find?sort={"name":-1}&limit=2&skip=1', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 2);
            assert.equal(data[0].name, 'rachael');
            assert.equal(data[1].name, 'mike');
            done();
          });
        });
      });

    });

    describe('after reloading actions :: ', function() {

      before(function() {
        extraSailsConfig = {
          orm: {
            moduleDefinitions: {
              models: {
                user: {
                  attributes: {
                    name: 'string'
                  }
                }
              }
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      it('should still respond to RESTful blueprint requests correctly :: ', function(done) {
        sailsApp.models.user.create([{name: 'scott'}, {name: 'mike'}]).exec(function(err) {
          if (err) {return done(err);}
          sailsApp.reloadActions(function(err) {
            if (err) {return done(err);}
            sailsApp.request('get /user/find', function (err, resp, data) {
              assert(!err, err);
              assert.equal(data.length, 2);
              done();
            });
          });
        });
      });

    });

    describe('with pluralize turned on :: ', function() {

      before(function() {
        extraSailsConfig = {
          blueprints: {
            pluralize: true
          },
          orm: {
            moduleDefinitions: {
              models: {
                user: {},
                quiz: {}
              }
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      it('should bind blueprint actions to plural controller names', function(done) {
        sailsApp.models.user.create({}).exec(function(err) {
          if (err) {return done (err);}
          sailsApp.request('get /users/find', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 1);
            assert.equal(data[0].id, 1);
            done();
          });
        });
      });

      it('should bind blueprint actions to plural controller names (quiz => quizzes)', function(done) {
        sailsApp.models.quiz.create({}).exec(function(err) {
          if (err) {return done (err);}
          sailsApp.request('get /quizzes/find', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 1);
            assert.equal(data[0].id, 1);
            done();
          });
        });
      });

      it('should not bind blueprint actions to singular controller names', function(done) {
        sailsApp.models.user.create({}).exec(function(err) {
          if (err) {return done (err);}
          sailsApp.request('get /user/find', function (err, resp, data) {
            assert(err);
            assert.equal(err.status, 404);
            done();
          });
        });
      });

    });

    describe('with `prefix` option set to \'/api\' :: ', function() {

      before(function() {
        extraSailsConfig = {
          blueprints: {
            prefix: '/api'
          },
          orm: {
            moduleDefinitions: {
              models: {
                user: {
                  attributes: {
                    name: 'string'
                  }
                }
              }
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      describe('a get request to /api/:model/find', function() {

        it('should return JSON for all of the instances of the test model', function(done) {
          sailsApp.models.user.create({name: 'joy'}).exec(function(err) {
            if (err) {return done (err);}
            sailsApp.request('get /api/user/find', function (err, resp, data) {
              assert(!err, err);
              assert.equal(data.length, 1);
              assert.equal(data[0].name, 'joy');
              assert.equal(data[0].id, 1);
              done();
            });
          });
        });
      });

      describe('a get request to /:model/find', function() {

        it('should return a 404', function(done) {
          sailsApp.request('get /user/find', function (err, resp, data) {
            assert(err);
            assert.equal(err.status, 404);
            done();
          });
        });
      });

    });

    describe('with `restPrefix` option set to \'/v1\' :: ', function() {

      before(function() {
        extraSailsConfig = {
          blueprints: {
            restPrefix: '/v1'
          },
          orm: {
            moduleDefinitions: {
              models: {
                user: {
                  attributes: {
                    name: 'string'
                  }
                }
              }
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      describe('a get request to /v1/:model/find', function() {

        it('should return a 404 (rest prefix should have no effect on shortcut routes', function(done) {
          sailsApp.request('get /v1/user/find', function (err, resp, data) {
            assert(err);
            assert.equal(err.status, 404);
            done();
          });
        });


      });

      describe('a get request to /:model/find', function() {

        it('should return JSON for all of the instances of the test model', function(done) {
          sailsApp.models.user.create({name: 'al'}).exec(function(err) {
            if (err) {return done (err);}
            sailsApp.request('get /user/find', function (err, resp, data) {
              assert(!err, err);
              assert.equal(data.length, 1);
              assert.equal(data[0].name, 'al');
              assert.equal(data[0].id, 1);
              done();
            });
          });
        });
      });

    });

    describe('overriding blueprints :: ', function() {

      before(function() {
        extraSailsConfig = {
          orm: {
            moduleDefinitions: {
              models: {
                user: {},
              },
            }
          },
          controllers: {
            moduleDefinitions: {
              'user/find': function(req, res) {
                return res.send('find dem users!');
              }
            }
          }
        };
      });

      after(function() {
        extraSailsConfig = {};
      });

      it('if a `:model.find` action is explicitly added, it should be used in response to `GET /:model/find`', function(done) {
        sailsApp.models.user.create({name: 'al'}).exec(function(err) {
          if (err) {return done (err);}
          sailsApp.request('get /user/find', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data, 'find dem users!');
            done();
          });
        });
      });


    });

  });

});
