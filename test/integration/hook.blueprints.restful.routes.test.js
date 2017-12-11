/**
 * Test dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');
var Filesystem = require('machinepack-fs');

var appHelper = require('./helpers/appHelper');
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

  describe('restful routes :: ', function() {

    describe('when turned off globaly :: ', function() {

      before(function(done) {
        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);
        appHelper.linkDeps(tmpDir.name);
        (new Sails()).load({
          hooks: {
            grunt: false, views: false, policies: false, pubsub: false, i18n: false
          },
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
          },
          models: {
            migrate: 'drop',
            schema: true,
            attributes: {
              createdAt: { type: 'number', autoCreatedAt: true, },
              updatedAt: { type: 'number', autoUpdatedAt: true, },
              // id: { type: 'string', unique: true, columnName: '_id'},
              id: { type: 'number', autoIncrement: true}
            }
          },
          blueprints: {
            rest: false,
            shortcuts: false,
            actions: false
          },
          log: {level: 'error'}
        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      after(function(done) {
        extraSailsConfig = {};
        sailsApp.lower(function() {
          process.chdir(curDir);
          return done();
        });
      });

      it('a get request to /:model should return a 404', function(done) {
        sailsApp.models.user.create({name: 'al'}).exec(function(err) {
          if (err) {return done (err);}
          sailsApp.request('get /user', function (err, resp, data) {
            assert(err);
            assert.equal(err.status, 404);
            done();
          });
        });
      });

    });

    describe('when turned off for a specific controller :: ', function() {

      before(function(done) {
        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);
        appHelper.linkDeps(tmpDir.name);

        Filesystem.writeSync({
          force: true,
          destination: 'api/controllers/UserController.js',
          string: 'module.exports = { _config: { rest: false } }'
        }).execSync();

        (new Sails()).load({
          hooks: {
            grunt: false, views: false, policies: false, pubsub: false, i18n: false
          },
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
          },
          models: {
            migrate: 'drop',
            schema: true,
            attributes: {
              createdAt: { type: 'number', autoCreatedAt: true, },
              updatedAt: { type: 'number', autoUpdatedAt: true, },
              // id: { type: 'string', unique: true, columnName: '_id'},
              id: { type: 'number', autoIncrement: true}
            }
          },
          blueprints: {
            shortcuts: false,
            actions: false
          },
          log: {level: 'error'}
        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      after(function(done) {
        extraSailsConfig = {};
        sailsApp.lower(function() {
          process.chdir(curDir);
          return done();
        });
      });

      it('a get request to the /:model with REST disabled should return a 404', function(done) {
        sailsApp.models.user.create({name: 'al'}).exec(function(err) {
          if (err) {return done (err);}
          sailsApp.request('get /user', function (err, resp, data) {
            assert(err);
            assert.equal(err.status, 404);
            done();
          });
        });
      });

      it('a get request to the /:model with REST enabled should return JSON for all of the instances of the test model', function(done) {
        sailsApp.models.pet.create({name: 'rex'}).exec(function(err) {
          if (err) {return done (err);}
          sailsApp.request('get /pet', function (err, resp, data) {
            assert(!err, err);
            assert.equal(data.length, 1);
            assert.equal(data[0].name, 'rex');
            assert.equal(data[0].id, 1);
            done();
          });
        });
      });

    });

    describe('when turned on :: ', function() {

      beforeEach(function(done) {
        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);
        appHelper.linkDeps(tmpDir.name);
        (new Sails()).load(_.merge({
          hooks: {
            grunt: false, views: false, policies: false, i18n: false
          },
          orm: {
            moduleDefinitions: {
              models: { 'user': {} }
            }
          },
          models: {
            migrate: 'drop',
            schema: true,
            attributes: {
              createdAt: { type: 'number', autoCreatedAt: true, },
              updatedAt: { type: 'number', autoUpdatedAt: true, },
              // id: { type: 'string', unique: true, columnName: '_id'},
              id: { type: 'number', autoIncrement: true}
            }
          },
          blueprints: {
            shortcuts: false,
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
                      },
                      animalFriends: {
                        collection: 'pet',
                        via: 'humanFriends'
                      }
                    }
                  },
                  pet: {
                    attributes: {
                      name: 'string',
                      owner: {
                        model: 'user'
                      },
                      humanFriends: {
                        collection: 'user',
                        via: 'animalFriends'
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

        describe('a get request to /archive (the default archive model', function() {
          it('should return a 404', function(done) {
            sailsApp.request('get /archive', function (err) {
              assert(err, 'Should have received an error trying to access blueprint for archive model, but didn\'t!');
              assert.equal(err.status, 404);
              done();
            });
          });
        });

        describe('a get request to /:model', function() {

          describe('where a single instance of the model exists', function() {

            it('should return JSON for all of the instances of the test model', function(done) {
              sailsApp.models.user.create({name: 'al'}).exec(function(err) {
                if (err) {return done (err);}
                sailsApp.request('get /user', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 1);
                  assert.equal(data[0].name, 'al');
                  assert.equal(data[0].id, 1);
                  done();
                });
              });
            });


            it('should populate all associations of the test model', function(done) {
              sailsApp.models.pet.createEach([{name: 'alice'}, {name: 'tex'}, {name: 'bailey'}]).meta({fetch: true}).exec(function(err, pets) {
                sailsApp.models.user.create({name: 'al', pets: _.pluck(pets, 'id')}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.request('get /user', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 1);
                    assert.equal(data[0].name, 'al');
                    assert.equal(data[0].id, 1);
                    assert.equal(data[0].pets.length, 3);
                    done();
                  });
                });
              });
            });

            it('should limit populate records to the default limit (30)', function(done) {
              var instancesToCreate = _.map(_.range(1,41), function(i) {
                return { name: 'pet' + i };
              });
              sailsApp.models.pet.createEach(instancesToCreate).meta({fetch: true}).exec(function(err, pets) {
                sailsApp.models.user.create({name: 'al', pets: _.pluck(pets, 'id')}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.request('get /user', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 1);
                    assert.equal(data[0].name, 'al');
                    assert.equal(data[0].id, 1);
                    assert.equal(data[0].pets.length, 30);
                    done();
                  });
                });
              });
            });

          });

          describe('where 40 instances of the model exist, with no limit set', function() {

            it('should return JSON for 30 instances of the test model (becase the default limit is 30)', function(done) {
              var instancesToCreate = _.map(_.range(1,41), function(i) {
                return { name: 'user_' + i };
              });
              sailsApp.models.user.createEach(instancesToCreate).exec(function(err) {
                if (err) {return done (err);}
                sailsApp.request('get /user', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 30);
                  done();
                });
              });
            });

          });

          describe('where 40 instances of the model exist, with limit set to 35', function() {

            it('should return JSON for 35 instances of the test model', function(done) {
              var instancesToCreate = _.map(_.range(1,41), function(i) {
                return { name: 'user_' + i };
              });
              sailsApp.models.user.createEach(instancesToCreate).exec(function(err) {
                if (err) {return done (err);}
                sailsApp.request('get /user?limit=35', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 35);
                  done();
                });
              });
            });

          });

        });

        describe('a get request to /:model?id=1', function() {

          it('should return an array of 1 item', function(done) {
            sailsApp.models.user.create({name: 'jeremy'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /user?id=1', function (err, resp, data) {
                assert(!err, err);
                assert(_.isArray(data), 'Should have receieved an array, but got: ' + util.inspect(data, {depth: null}));
                assert.equal(data.length, 1);
                assert.equal(data[0].name, 'jeremy');
                assert.equal(data[0].id, 1);
                done();
              });
            });
          });
        });


        describe('a get request to /:model/:id', function() {

          it('should return JSON for the requested instance of the test model', function(done) {
            sailsApp.models.user.create({name: 'ron'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /user/1', function (err, resp, data) {
                assert(!err, err);
                assert.equal(data.name, 'ron');
                assert.equal(data.id, 1);
                done();
              });
            });
          });
        });

        describe('a patch request to /:model/:id', function() {

          it('should return JSON for an updated instance of the test model', function(done) {
            sailsApp.models.user.create({name: 'dave'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('patch /user/1', {name: 'larry'}, function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.name, 'larry');
                assert.equal(data.id, 1);
                sailsApp.models.user.findOne({id: 1}).exec(function(err, user) {
                  if (err) {return done (err);}
                  assert(user);
                  assert.equal(user.name, 'larry');
                  return done();
                });
              });
            });
          });
        });

        describe('a put request to /:model/:id', function() {

          it('should return JSON for an updated instance of the test model', function(done) {
            sailsApp.models.user.create({name: 'dave'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('put /user/1', {name: 'bob'}, function (err, resp, data) {
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

        describe('a post request to /:model', function() {

          it('should return JSON for a newly created instance of the test model', function(done) {
            sailsApp.request('post /user', {name: 'joe'}, function (err, resp, data) {
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


        describe('a delete request to /:model', function() {

          it('should return JSON for the deleted instance of the test model', function(done) {
            sailsApp.models.user.create({name: 'bubba'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('delete /user/1', function (err, resp, data) {
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

        //   █████╗ ███████╗███████╗ ██████╗  ██████╗██╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗
        //  ██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔════╝██║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
        //  ███████║███████╗███████╗██║   ██║██║     ██║███████║   ██║   ██║██║   ██║██╔██╗ ██║███████╗
        //  ██╔══██║╚════██║╚════██║██║   ██║██║     ██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║
        //  ██║  ██║███████║███████║╚██████╔╝╚██████╗██║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║
        //  ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝
        //

        describe('associations :: ', function() {

          describe('one to many :: ', function() {

            describe('a post request to /:model with an array specified for a collection attribute', function() {

              it('should return JSON for the new record including the associated collection', function(done) {
                sailsApp.models.pet.create({name: 'spot'}).meta({fetch: true}).exec(function(err, spot) {
                  sailsApp.request('post /user', {name: 'will', pets: [spot.id]}, function (err, resp, data) {
                    if (err) {return done (err);}
                    assert.equal(data.name, 'will');
                    assert.equal(data.id, 1);
                    assert.equal(data.pets.length, 1);
                    assert.equal(data.pets[0].name, 'spot');
                    return done();
                  });
                });
              });
            });


            describe('a get request to /:model/:parentid/:association for a plural association', function() {

              describe('where a single child instance exists', function() {

                it('should return JSON for the specified collection of the test model', function(done) {
                  sailsApp.models.pet.create({name: 'spot'}).meta({fetch: true}).exec(function(err, spot) {
                    sailsApp.models.user.create({name: 'will', pets: [spot.id]}).meta({fetch: true}).exec(function(err, will) {
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

              });

              describe('where a 40 instances exist, and no limit is given', function() {

                it('should return JSON for 30 records of the specified collection of the test model (since the default limit is 30)', function(done) {
                  var instancesToCreate = _.map(_.range(1,41), function(i) {
                    return { name: 'pet_' + i };
                  });
                  sailsApp.models.pet.createEach(instancesToCreate).meta({fetch: true}).exec(function(err, pets) {
                    sailsApp.models.user.create({name: 'will', pets: _.pluck(pets, 'id')}).meta({fetch: true}).exec(function(err, will) {
                      if (err) {return done (err);}
                      sailsApp.request('get /user/1/pets', function (err, resp, data) {
                        if (err) {return done (err);}
                        assert.equal(data.length, 30);
                        return done();
                      });
                    });
                  });
                });

              });


              describe('where a 40 instances exist, and a limit of 35 is given', function() {

                it('should return JSON for 35 records of the specified collection of the test model', function(done) {
                  var instancesToCreate = _.map(_.range(1,41), function(i) {
                    return { name: 'pet_' + i };
                  });
                  sailsApp.models.pet.createEach(instancesToCreate).meta({fetch: true}).exec(function(err, pets) {
                    sailsApp.models.user.create({name: 'will', pets: _.pluck(pets, 'id')}).meta({fetch: true}).exec(function(err, will) {
                      if (err) {return done (err);}
                      sailsApp.request('get /user/1/pets?limit=35', function (err, resp, data) {
                        if (err) {return done (err);}
                        assert.equal(data.length, 35);
                        return done();
                      });
                    });
                  });
                });

              });

            });

            describe('a get request to /:model/:parentid/:association for a plural association with no associated records', function() {

              it('should return JSON for the specified collection of the test model', function(done) {
                sailsApp.models.user.create({name: 'will'}).meta({fetch: true}).exec(function(err, will) {
                  if (err) {return done (err);}
                  sailsApp.request('get /user/1/pets', function (err, resp, data) {
                    if (err) {return done (err);}
                    assert.equal(data.length, 0);
                    return done();
                  });
                });
              });
            });

            describe('a get request to /:model/:parentid/:association for a singular association', function() {

              it('should return JSON for the specified collection of the test model', function(done) {
                sailsApp.models.pet.create({name: 'spot'}).meta({fetch: true}).exec(function(err, spot) {
                  sailsApp.models.user.create({name: 'will', pets: [spot.id]}).meta({fetch: true}).exec(function(err, will) {
                    if (err) {return done (err);}
                    sailsApp.request('get /pet/1/owner', function (err, resp, data) {
                      if (err) {return done (err);}
                      assert.equal(data.name, 'will');
                      assert.equal(data.id, 1);
                      return done();
                    });
                  });
                });
              });
            });

            describe('a get request to /:model/:parentid/:association for a singular association with no associated record', function() {

              it('should return JSON for the specified collection of the test model', function(done) {
                sailsApp.models.pet.create({name: 'spot'}).meta({fetch: true}).exec(function(err, spot) {
                  sailsApp.request('get /pet/1/owner', function (err, resp, data) {
                    if (err) {
                      if (err.status && err.status === 404) {
                        return done();
                      }
                      return done(new Error('Should have responded with a 404 error, but instead got:' + util.inspect(err, {depth: null})));
                    }
                    return done(new Error('Should have responded with a 404 error, but instead got:' + util.inspect(data, {depth: null})));
                  });
                });
              });
            });

            describe('a get request to /:model/:parentid/:association/:id', function() {

              it('should return a 404', function(done) {
                sailsApp.models.pet.createEach([{name: 'bubbles'}, {name: 'dempsey'}]).meta({fetch: true}).exec(function(err, pets) {
                  sailsApp.models.user.create({name: 'roger', pets: _.pluck(pets,'id')}).meta({fetch: true}).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('get /user/1/pets/2', function (err, resp, data) {
                      if (err) {
                        if (err.status && err.status === 404) {
                          return done();
                        }
                        return done(new Error('Should have responded with a 404 error, but instead got:' + util.inspect(err, {depth: null})));
                      }
                      return done(new Error('Should have responded with a 404 error, but instead got:' + util.inspect(data, {depth: null})));
                    });
                  });
                });
              });
            });

            describe('a put request to /:model/:parentid/:association/:id', function() {

              it('should return JSON for an instance of the test model, with its collection updated', function(done) {
                sailsApp.models.user.create({name: 'ira'}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.models.pet.create({name: 'flipper'}).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('put /user/1/pets/1', function (err, resp, data) {
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

            describe('a put request to /:model/:parentid/:association (with empty array)', function() {

              it('should return JSON for an instance of the test model, with its collection replaced', function(done) {
                sailsApp.models.user.create({name: 'ira', id: 1}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.models.pet.create({name: 'flipper', id: 1, owner: 1}).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('put /user/1/pets', [], function (err, resp, data) {
                      if (err) {return done (err);}
                      assert.equal(data.name, 'ira');
                      assert.equal(data.pets.length, 0);
                      sailsApp.models.pet.findOne({id: 1}).populate('owner').exec(function(err, pet) {
                        if (err) {return done (err);}
                        assert(pet);
                        assert.equal(pet.name, 'flipper');
                        assert.equal(pet.id, 1);
                        assert.equal(pet.owner, null);
                        return done();
                      });
                    });
                  });
                });
              });
            });

            describe('a put request to /:model/:parentid/:association (with new array)', function() {

              it('should return JSON for an instance of the test model, with its collection replaced', function(done) {
                sailsApp.models.user.create({name: 'zooey'}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.models.pet.createEach([{name: 'ralph', id: 1, owner: 1}, {name: 'fiona', id: 2}]).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('put /user/1/pets', [2], function (err, resp, data) {
                      if (err) {return done (err);}
                      assert.equal(data.name, 'zooey');
                      assert.equal(data.pets.length, 1);
                      assert.equal(data.pets[0].id, 2);
                      assert.equal(data.pets[0].name, 'fiona');
                      sailsApp.models.pet.findOne({id: 2}).populate('owner').exec(function(err, pet) {
                        if (err) {return done (err);}
                        assert(pet);
                        assert.equal(pet.name, 'fiona');
                        assert.equal(pet.id, 2);
                        assert.equal(pet.owner.name, 'zooey');
                        assert.equal(pet.owner.id, 1);
                        return done();
                      });
                    });
                  });
                });
              });
            });

            describe('a delete request to /:model/:parentid/:association/:id', function() {

              it('should return JSON for an instance of the test model, with its collection updated', function(done) {
                sailsApp.models.pet.create({name: 'alice'}).meta({fetch: true}).exec(function(err, alice) {
                  sailsApp.models.user.create({name: 'larry', pets: [alice.id]}).meta({fetch: true}).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('delete /user/1/pets/1', function (err, resp, data) {
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
            });

          });

          describe('many-to-many :: ', function() {

            describe('a post request to /:model with an array specified for a collection attribute', function() {

              it('should return JSON for the new record including the associated collection', function(done) {
                sailsApp.models.pet.create({name: 'spot'}).meta({fetch: true}).exec(function(err, spot) {
                  sailsApp.request('post /user', {name: 'will', animalFriends: [spot.id]}, function (err, resp, data) {
                    if (err) {return done (err);}
                    assert.equal(data.name, 'will');
                    assert.equal(data.id, 1);
                    assert.equal(data.animalFriends.length, 1);
                    assert.equal(data.animalFriends[0].name, 'spot');
                    return done();
                  });
                });
              });
            });


            describe('a get request to /:model/:parentid/:association for a plural association', function() {

              describe('where a single child instance exists', function() {

                it('should return JSON for the specified collection of the test model', function(done) {
                  sailsApp.models.pet.create({name: 'spot'}).meta({fetch: true}).exec(function(err, spot) {
                    sailsApp.models.user.create({name: 'will', animalFriends: [spot.id]}).meta({fetch: true}).exec(function(err, will) {
                      if (err) {return done (err);}
                      sailsApp.request('get /user/1/animalFriends', function (err, resp, data) {
                        if (err) {return done (err);}
                        assert.equal(data.length, 1);
                        assert.equal(data[0].name, 'spot');
                        assert.equal(data[0].id, 1);
                        return done();
                      });
                    });
                  });
                });

              });

              describe('where a 40 instances exist, and no limit is given', function() {

                it('should return JSON for 30 records of the specified collection of the test model (since the default limit is 30)', function(done) {
                  var instancesToCreate = _.map(_.range(1,41), function(i) {
                    return { name: 'pet_' + i };
                  });
                  sailsApp.models.pet.createEach(instancesToCreate).meta({fetch: true}).exec(function(err, pets) {
                    sailsApp.models.user.create({name: 'will', animalFriends: _.pluck(pets, 'id')}).meta({fetch: true}).exec(function(err, will) {
                      if (err) {return done (err);}
                      sailsApp.request('get /user/1/animalFriends', function (err, resp, data) {
                        if (err) {return done (err);}
                        assert.equal(data.length, 30);
                        return done();
                      });
                    });
                  });
                });

              });


              describe('where a 40 instances exist, and a limit of 35 is given', function() {

                it('should return JSON for 35 records of the specified collection of the test model', function(done) {
                  var instancesToCreate = _.map(_.range(1,41), function(i) {
                    return { name: 'pet_' + i };
                  });
                  sailsApp.models.pet.createEach(instancesToCreate).meta({fetch: true}).exec(function(err, pets) {
                    sailsApp.models.user.create({name: 'will', animalFriends: _.pluck(pets, 'id')}).meta({fetch: true}).exec(function(err, will) {
                      if (err) {return done (err);}
                      sailsApp.request('get /user/1/animalFriends?limit=35', function (err, resp, data) {
                        if (err) {return done (err);}
                        assert.equal(data.length, 35);
                        return done();
                      });
                    });
                  });
                });

              });

            });

            describe('a get request to /:model/:parentid/:association for a plural association with no associated records', function() {

              it('should return JSON for the specified collection of the test model', function(done) {
                sailsApp.models.user.create({name: 'will'}).meta({fetch: true}).exec(function(err, will) {
                  if (err) {return done (err);}
                  sailsApp.request('get /user/1/animalFriends', function (err, resp, data) {
                    if (err) {return done (err);}
                    assert.equal(data.length, 0);
                    return done();
                  });
                });
              });
            });

            describe('a put request to /:model/:parentid/:association/:id', function() {

              it('should return JSON for an instance of the test model, with its collection updated', function(done) {
                sailsApp.models.user.create({name: 'ira'}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.models.pet.create({name: 'flipper'}).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('put /user/1/animalFriends/1', function (err, resp, data) {
                      if (err) {return done (err);}
                      assert.equal(data.name, 'ira');
                      assert.equal(data.id, 1);
                      assert.equal(data.animalFriends.length, 1);
                      assert.equal(data.animalFriends[0].name, 'flipper');
                      sailsApp.models.user.findOne({id: 1}).populate('animalFriends').exec(function(err, user) {
                        if (err) {return done (err);}
                        assert(user);
                        assert.equal(user.name, 'ira');
                        assert.equal(user.id, 1);
                        assert.equal(user.animalFriends.length, 1);
                        assert.equal(user.animalFriends[0].name, 'flipper');
                        return done();
                      });
                    });
                  });
                });
              });
            });

            describe('a put request to /:model/:parentid/:association (with empty array)', function() {

              it('should return JSON for an instance of the test model, with its collection replaced', function(done) {
                sailsApp.models.user.create({name: 'ira', id: 1}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.models.pet.create({name: 'flipper', id: 1, humanFriends: [1]}).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('put /user/1/animalFriends', [], function (err, resp, data) {
                      if (err) {return done (err);}
                      assert.equal(data.name, 'ira');
                      assert.equal(data.animalFriends.length, 0);
                      sailsApp.models.pet.findOne({id: 1}).populate('humanFriends').exec(function(err, pet) {
                        if (err) {return done (err);}
                        assert(pet);
                        assert.equal(pet.name, 'flipper');
                        assert.equal(pet.id, 1);
                        assert.equal(pet.humanFriends.length, 0);
                        return done();
                      });
                    });
                  });
                });
              });
            });

            describe('a put request to /:model/:parentid/:association (with new array)', function() {

              it('should return JSON for an instance of the test model, with its collection replaced', function(done) {
                sailsApp.models.user.create({name: 'zooey'}).exec(function(err) {
                  if (err) {return done (err);}
                  sailsApp.models.pet.createEach([{name: 'ralph', id: 1, humanFriends: [1]}, {name: 'fiona', id: 2}]).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('put /user/1/animalFriends', [2], function (err, resp, data) {
                      if (err) {return done (err);}
                      assert.equal(data.name, 'zooey');
                      assert.equal(data.animalFriends.length, 1);
                      assert.equal(data.animalFriends[0].id, 2);
                      assert.equal(data.animalFriends[0].name, 'fiona');
                      sailsApp.models.pet.findOne({id: 2}).populate('humanFriends').exec(function(err, pet) {
                        if (err) {return done (err);}
                        assert(pet);
                        assert.equal(pet.name, 'fiona');
                        assert.equal(pet.id, 2);
                        assert.equal(pet.humanFriends.length, 1);
                        assert.equal(pet.humanFriends[0].id, 1);
                        return done();
                      });
                    });
                  });
                });
              });
            });

            describe('a delete request to /:model/:parentid/:association/:id', function() {

              it('should return JSON for an instance of the test model, with its collection updated', function(done) {
                sailsApp.models.pet.create({name: 'alice'}).meta({fetch: true}).exec(function(err, alice) {
                  sailsApp.models.user.create({name: 'larry', animalFriends: [alice.id]}).meta({fetch: true}).exec(function(err) {
                    if (err) {return done (err);}
                    sailsApp.request('delete /user/1/animalFriends/1', function (err, resp, data) {
                      if (err) {return done (err);}
                      assert.equal(data.name, 'larry');
                      assert.equal(data.id, 1);
                      assert.equal(data.animalFriends.length, 0);
                      sailsApp.models.user.findOne({id: 1}).populate('animalFriends').exec(function(err, user) {
                        if (err) {return done (err);}
                        assert(user);
                        assert.equal(user.name, 'larry');
                        assert.equal(user.id, 1);
                        assert.equal(user.animalFriends.length, 0);
                        return done();
                      });
                    });
                  });
                });
              });
            });

          });



        });

        describe('with a custom parseBlueprintOptions for all blueprints', function() {

          before(function() {
            extraSailsConfig = {
              blueprints: {
                parseBlueprintOptions: function(req) {
                  var queryOptions = req._sails.hooks.blueprints.parseBlueprintOptions(req);
                  if (queryOptions.populates.pets) {
                    queryOptions.populates.pets.limit = 1;
                  }
                  return queryOptions;
                }
              },
              routes: {
                'GET /yolo/:id': 'user/findOne',
              },
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

          it('the custom `parseBlueprintOptions` should be applied to the `find` blueprint', function(done) {

            sailsApp.models.pet.createEach([{name: 'alice'}, {name: 'rex'}]).meta({fetch: true}).exec(function(err, pets) {
              if (err) {return done(err);}
              sailsApp.models.user.create({name: 'bill', pets: _.pluck(pets, sailsApp.models.pet.primaryKey)}).exec(function(err, bill) {
                if (err) {return done(err);}
                sailsApp.request('get /user/' + bill[sailsApp.models.user.primaryKey], function (err, resp, data) {
                  if (err) {return done (err);}
                  assert.equal(data.name, 'bill');
                  assert(data.pets, 'Record should have `pets` key, but none was found.  Full record: ' + util.inspect(data, {depth: null}));
                  assert.equal(data.pets.length, 1);
                  return done();
                });
              });
            });

          });

          it('the custom `parseBlueprintOptions` should be applied to the `create` blueprint', function(done) {

            sailsApp.models.pet.createEach([{name: 'june'}, {name: 'jane'}]).meta({fetch: true}).exec(function(err, pets) {
              if (err) {return done(err);}
              sailsApp.request('post /user', {name: 'bob', pets: _.pluck(pets, sailsApp.models.pet.primaryKey)}, function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.name, 'bob');
                assert(data.pets, 'Record should have `pets` key, but none was found.  Full record: ' + util.inspect(data, {depth: null}));
                assert.equal(data.pets.length, 1);
                return done();
              });
            });

          });

          it('the custom `parseBlueprintOptions` should be applied to a user-defined (i.e. not shadow) route', function(done) {

            sailsApp.models.pet.createEach([{name: 'lolly'}, {name: 'dolly'}]).meta({fetch: true}).exec(function(err, pets) {
              if (err) {return done(err);}
              sailsApp.models.user.create({name: 'bruce', pets: _.pluck(pets, sailsApp.models.pet.primaryKey)}).exec(function(err, bruce) {
                if (err) {return done(err);}
                sailsApp.request('get /yolo/' + bruce[sailsApp.models.user.primaryKey], function (err, resp, data) {
                  if (err) {return done (err);}
                  assert.equal(data.name, 'bruce');
                  assert(data.pets, 'Record should have `pets` key, but none was found.  Full record: ' + util.inspect(data, {depth: null}));
                  assert.equal(data.pets.length, 1);
                  return done();
                });
              });
            });


          });

        });

        describe('with a custom parseBlueprintOptions that disables auto-population (tests #4138)', function() {

          before(function() {
            extraSailsConfig = {
              hooks: {
                pubsub: undefined
              },
              blueprints: {
                parseBlueprintOptions: function(req) {
                  var queryOptions = req._sails.hooks.blueprints.parseBlueprintOptions(req);

                  if (!req.param('populate', false) && !queryOptions.alias) {
                    queryOptions.populates = {};
                  }
                  return queryOptions;
                }
              },
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

          it('the delete blueprint should not cause any errors', function(done) {
            sailsApp.models.pet.createEach([{name: 'alice'}, {name: 'rex'}]).meta({fetch: true}).exec(function(err, pets) {
              if (err) {return done(err);}
              sailsApp.models.user.create({name: 'bill', pets: _.pluck(pets, sailsApp.models.pet.primaryKey)}).exec(function(err, bill) {
                if (err) {return done(err);}
                sailsApp.request('delete /user/' + bill[sailsApp.models.user.primaryKey], function (err, resp, data) {
                  if (err) {return done (err);}
                  return done();
                });
              });
            });

          });

        });

        describe('with a custom parseBlueprintOptions for a specific route', function() {

          before(function() {
            extraSailsConfig = {
              routes: {
                'GET /user/:id': {
                  action: 'user/findOne',
                  parseBlueprintOptions: function(req) {
                    var queryOptions = req._sails.hooks.blueprints.parseBlueprintOptions(req);
                    queryOptions.populates.pets.limit = 1;
                    return queryOptions;
                  }
                }
              },
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

          it('the custom `parseBlueprintOptions` should be applied to the specific route', function(done) {

            sailsApp.models.pet.createEach([{name: 'alice'}, {name: 'rex'}]).meta({fetch: true}).exec(function(err, pets) {
              if (err) {return done(err);}
              sailsApp.models.user.create({name: 'bill', pets: _.pluck(pets, sailsApp.models.pet.primaryKey)}).exec(function(err, bill) {
                if (err) {return done(err);}
                sailsApp.request('get /user/' + bill[sailsApp.models.user.primaryKey], function (err, resp, data) {
                  if (err) {return done (err);}
                  assert.equal(data.name, 'bill');
                  assert(data.pets, 'Record should have `pets` key, but none was found.  Full record: ' + util.inspect(data, {depth: null}));
                  assert.equal(data.pets.length, 1);
                  return done();
                });
              });
            });

          });

          it('the custom `parseBlueprintOptions` should NOT be applied to a different route blueprint', function(done) {

            sailsApp.models.pet.createEach([{name: 'june'}, {name: 'jane'}]).meta({fetch: true}).exec(function(err, pets) {
              if (err) {return done(err);}
              sailsApp.request('post /user', {name: 'bob', pets: _.pluck(pets, sailsApp.models.pet.primaryKey)}, function (err, resp, data) {
                if (err) {return done (err);}
                assert.equal(data.name, 'bob');
                assert(data.pets, 'Record should have `pets` key, but none was found.  Full record: ' + util.inspect(data, {depth: null}));
                assert.equal(data.pets.length, 2);
                return done();
              });
            });

          });


        });

      });

      describe('using query string params :: ', function() {

        describe('with the `find` blueprint :: ', function() {

          describe('filtering :: ', function() {

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

            it('a get request to /:model?name=scott should respond with the correctly filtered instances', function(done) {
              sailsApp.models.user.createEach([{name: 'scott'}, {name: 'mike'}]).exec(function(err) {
                if (err) {return done(err);}
                sailsApp.request('get /user?name=scott', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 1);
                  assert.equal(data[0].name, 'scott');
                  done();
                });
              });
            });

            it('a get request to /:model?where={...} should respond with the correctly filtered instances', function(done) {
              sailsApp.models.user.createEach([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {        if (err) {return done(err);}
                sailsApp.request('get /user?where={"name": {">": "irl"}}', function (err, resp, data) {
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

            it('a get request to /:model?sort=name%20asc&limit=2&skip=1 should respond with the correctly filtered instances', function(done) {
              sailsApp.models.user.createEach([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {
                if (err) {return done(err);}
                sailsApp.request('get /user?sort=name%20asc&limit=2&skip=1', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 2);
                  assert.equal(data[0].name, 'irl');
                  assert.equal(data[1].name, 'mike');
                  done();
                });
              });
            });

            it('a get request to /:model?sort=name%20desc&limit=2&skip=1 should respond with the correctly filtered instances', function(done) {
              sailsApp.models.user.createEach([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {
                if (err) {return done(err);}
                sailsApp.request('get /user?sort=name%20desc&limit=2&skip=1', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 2);
                  assert.equal(data[0].name, 'rachael');
                  assert.equal(data[1].name, 'mike');
                  done();
                });
              });
            });

            it('a get request to /:model?sort={"name":-1}&limit=2&skip=1 should respond with the correctly filtered instances', function(done) {
              sailsApp.models.user.createEach([{name: 'scott'}, {name: 'mike'}, {name: 'rachael'}, {name: 'cody'}, {name: 'irl'}]).exec(function(err) {
                if (err) {return done(err);}
                sailsApp.request('get /user?sort={"name":-1}&limit=2&skip=1', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 2);
                  assert.equal(data[0].name, 'rachael');
                  assert.equal(data[1].name, 'mike');
                  done();
                });
              });
            });

          });

          describe('using `select` and `omit` in the query string', function() {

            before(function() {
              extraSailsConfig = {
                orm: {
                  moduleDefinitions: {
                    models: {
                      user: {
                        attributes: {
                          name: 'string',
                          favoriteColor: 'string',
                          luckyNumber: 'number'
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

            it('a get request to /:model?select=name, luckyNumber should respond with the correctly projected instances', function(done) {
              sailsApp.models.user.createEach([
                {name: 'scott', favoriteColor: 'grey', luckyNumber: 3},
                {name: 'mike', favoriteColor: 'blue', luckyNumber: 25},
                {name: 'rachael', favoriteColor: 'red', luckyNumber: 12},
                {name: 'cody', favoriteColor: 'blue', luckyNumber: 9},
                {name: 'irl', favoriteColor: 'black', luckyNumber: 66}
              ]).exec(function(err) {
                if (err) {return done(err);}
                sailsApp.request('get /user?select=name, luckyNumber', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 5);
                  _.each(data, function(row) {
                    assert(row.name);
                    assert(row.luckyNumber);
                    assert(!row.favoriteColor, 'Got favoriteColor for `' + row.name + '`, even though it wasn\'t selected!');
                  });
                  done();
                });
              });
            });

            it('a get request to /:model?omit=favoriteColor, luckyNumber should respond with the correctly projected instances', function(done) {
              sailsApp.models.user.createEach([
                {name: 'scott', favoriteColor: 'grey', luckyNumber: 3},
                {name: 'mike', favoriteColor: 'blue', luckyNumber: 25},
                {name: 'rachael', favoriteColor: 'red', luckyNumber: 12},
                {name: 'cody', favoriteColor: 'blue', luckyNumber: 9},
                {name: 'irl', favoriteColor: 'black', luckyNumber: 66}
              ]).exec(function(err) {
                if (err) {return done(err);}
                sailsApp.request('get /user?omit=favoriteColor, luckyNumber', function (err, resp, data) {
                  assert(!err, err);
                  assert.equal(data.length, 5);
                  _.each(data, function(row) {
                    assert(row.name);
                    assert(!row.luckyNumber, 'Got luckyNumber for `' + row.name + '`, even though it was omitted!');
                    assert(!row.favoriteColor, 'Got favoriteColor for `' + row.name + '`, even though it was omitted!');
                  });
                  done();
                });
              });
            });

          });

        });

        describe('with the `populate` blueprint :: ', function() {

          describe('filtering :: ', function() {

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
                    }
                  }
                }
              };
            });

            after(function() {
              extraSailsConfig = {};
            });

            it('a get request to /:model/:id/:association?name=alice should respond with the correctly filtered association records', function(done) {
              sailsApp.models.user.create({name: 'scott'}).meta({fetch: true}).exec(function(err, scott) {
                sailsApp.models.pet.createEach([{name: 'alice', owner: scott.id}, {name: 'mojo', owner: scott.id}]).exec(function(err) {
                  if (err) {return done(err);}
                  sailsApp.request('get /user/'+scott.id+'/pets?name=alice', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 1);
                    assert.equal(data[0].name, 'alice');
                    done();
                  });
                });
              });
            });

            it('a get request to /:model/:id/:association?where={...} should respond with the correctly filtered association records', function(done) {
              sailsApp.models.user.create({name: 'scott'}).meta({fetch: true}).exec(function(err, scott) {
                sailsApp.models.pet.createEach([{name: 'alice', owner: scott.id}, {name: 'mojo', owner: scott.id}, {name: 'bert', owner: scott.id}]).exec(function(err) {
                  if (err) {return done(err);}
                  sailsApp.request('get /user/'+scott.id+'/pets?where={"name":{">":"alice"}}', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 2);
                    var names = _.pluck(data, 'name');
                    assert(_.contains(names, 'bert'));
                    assert(_.contains(names, 'mojo'));
                    done();
                  });
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
                    }
                  }
                }
              };
            });

            after(function() {
              extraSailsConfig = {};
            });

            it('a get request to /:model/:id/:association?sort=name%20asc&limit=2&skip=1 should respond with the correctly filtered association records', function(done) {
              sailsApp.models.user.create({name: 'scott'}).meta({fetch: true}).exec(function(err, scott) {
                sailsApp.models.pet.createEach([{name: 'alice', owner: scott.id}, {name: 'mojo', owner: scott.id}, {name: 'bert', owner: scott.id}, {name: 'bandit', owner: scott.id}]).exec(function(err) {
                  if (err) {return done(err);}
                  sailsApp.request('get /user/'+scott.id+'/pets?sort=name%20asc&limit=2&skip=1', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 2);
                    var names = _.pluck(data, 'name');
                    assert(_.contains(names, 'bandit'));
                    assert(_.contains(names, 'bert'));
                    done();
                  });
                });
              });
            });

            it('a get request to /:model/:id/:association?sort=name%desc&limit=1&skip=1 should respond with the correctly filtered association records', function(done) {
              sailsApp.models.user.create({name: 'scott'}).meta({fetch: true}).exec(function(err, scott) {
                sailsApp.models.pet.createEach([{name: 'alice', owner: scott.id}, {name: 'mojo', owner: scott.id}, {name: 'bert', owner: scott.id}, {name: 'bandit', owner: scott.id}]).exec(function(err) {
                  if (err) {return done(err);}
                  sailsApp.request('get /user/'+scott.id+'/pets?sort=name%20desc&limit=1&skip=1', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 1);
                    var names = _.pluck(data, 'name');
                    assert(_.contains(names, 'bert'));
                    done();
                  });
                });
              });
            });

            it('a get request to /:model/:id/:association?sort={"name":-1}&limit=2&skip=1 should respond with the correctly filtered association records', function(done) {
              sailsApp.models.user.create({name: 'scott'}).meta({fetch: true}).exec(function(err, scott) {
                sailsApp.models.pet.createEach([{name: 'alice', owner: scott.id}, {name: 'mojo', owner: scott.id}, {name: 'bert', owner: scott.id}, {name: 'bandit', owner: scott.id}]).exec(function(err) {
                  if (err) {return done(err);}
                  sailsApp.request('get /user/'+scott.id+'/pets?sort={"name":-1}&limit=1&skip=1', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 1);
                    var names = _.pluck(data, 'name');
                    assert(_.contains(names, 'bert'));
                    done();
                  });
                });
              });
            });

          });

          describe('using `select` and `omit` in the query string', function() {

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
                          animal: 'string',
                          age: 'number',
                          owner: {
                            model: 'user'
                          }
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

            it('a get request to /:model/:id/:association?select=name, luckyNumber should respond with the correctly projected association records', function(done) {
              sailsApp.models.user.create({name: 'scott'}).meta({fetch: true}).exec(function(err, scott) {
                sailsApp.models.pet.createEach([
                  {name: 'alice', animal: 'cat', age: 3, owner: scott.id},
                  {name: 'bandit', animal: 'dog', age: 25, owner: scott.id},
                  {name: 'bert', animal: 'cat', age: 12, owner: scott.id},
                  {name: 'mojo', animal: 'cat', age: 9, owner: scott.id},
                  {name: 'rex', animal: 'cheetah', age: 66, owner: scott.id}
                ]).exec(function(err) {
                  if (err) {return done(err);}
                  sailsApp.request('get /user/' + scott.id + '/pets?select=name, age', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 5);
                    _.each(data, function(row) {
                      assert(row.name);
                      assert(row.age);
                      assert(!row.animal, 'Got animal for `' + row.name + '`, even though it wasn\'t selected!');
                    });
                    done();
                  });
                });
              });
            });

            it('a get request to /:model/:id/:association?omit=age, animal should respond with the correctly projected association records', function(done) {
              sailsApp.models.user.create({name: 'scott'}).meta({fetch: true}).exec(function(err, scott) {
                sailsApp.models.pet.createEach([
                  {name: 'alice', animal: 'cat', age: 3, owner: scott.id},
                  {name: 'bandit', animal: 'dog', age: 25, owner: scott.id},
                  {name: 'bert', animal: 'cat', age: 12, owner: scott.id},
                  {name: 'mojo', animal: 'cat', age: 9, owner: scott.id},
                  {name: 'rex', animal: 'cheetah', age: 66, owner: scott.id}
                ]).exec(function(err) {
                  if (err) {return done(err);}
                  sailsApp.request('get /user/' + scott.id + '/pets?omit=age, animal', function (err, resp, data) {
                    assert(!err, err);
                    assert.equal(data.length, 5);
                    _.each(data, function(row) {
                      assert(row.name);
                      assert(!row.age, 'Got age for `' + row.name + '`, even though it was omitted!');
                      assert(!row.animal, 'Got animal for `' + row.name + '`, even though it was omitted!');
                    });
                    done();
                  });
                });
              });
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
          sailsApp.models.user.createEach([{name: 'scott'}, {name: 'mike'}]).exec(function(err) {
            if (err) {return done(err);}
            sailsApp.reloadActions(function(err) {
              if (err) {return done(err);}
              sailsApp.request('get /user', function (err, resp, data) {
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
            sailsApp.request('get /users', function (err, resp, data) {
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
            sailsApp.request('get /quizzes', function (err, resp, data) {
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
            sailsApp.request('get /user', function (err, resp, data) {
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

        describe('a get request to /api/:model', function() {

          it('should return JSON for all of the instances of the test model', function(done) {
            sailsApp.models.user.create({name: 'joy'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /api/user', function (err, resp, data) {
                assert(!err, err);
                assert.equal(data.length, 1);
                assert.equal(data[0].name, 'joy');
                assert.equal(data[0].id, 1);
                done();
              });
            });
          });
        });

        describe('a get request to /:model', function() {

          it('should return a 404', function(done) {
            sailsApp.request('get /user', function (err, resp, data) {
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

        describe('a get request to /v1/:model', function() {

          it('should return JSON for all of the instances of the test model', function(done) {
            sailsApp.models.user.create({name: 'wanda'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /v1/user', function (err, resp, data) {
                assert(!err, err);
                assert.equal(data.length, 1);
                assert.equal(data[0].name, 'wanda');
                assert.equal(data[0].id, 1);
                done();
              });
            });
          });
        });

        describe('a get request to /:model', function() {

          it('should return a 404', function(done) {
            sailsApp.request('get /user', function (err, resp, data) {
              assert(err);
              assert.equal(err.status, 404);
              done();
            });
          });
        });

      });

      describe('with `prefix` option set to \'api\' and `restPrefix` option set to \'/v1\' :: ', function() {

        before(function() {
          extraSailsConfig = {
            blueprints: {
              prefix: '/api',
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

        describe('a get request to /api/v1/:model', function() {

          it('should return JSON for all of the instances of the test model', function(done) {
            sailsApp.models.user.create({name: 'ron'}).exec(function(err) {
              if (err) {return done (err);}
              sailsApp.request('get /api/v1/user', function (err, resp, data) {
                assert(!err, err);
                assert.equal(data.length, 1);
                assert.equal(data[0].name, 'ron');
                assert.equal(data[0].id, 1);
                done();
              });
            });
          });
        });

        describe('a get request to /:model', function() {

          it('should return a 404', function(done) {
            sailsApp.request('get /user', function (err, resp, data) {
              assert(err);
              assert.equal(err.status, 404);
              done();
            });
          });
        });

        describe('a get request to /api/:model', function() {

          it('should return a 404', function(done) {
            sailsApp.request('get /api/user', function (err, resp, data) {
              assert(err);
              assert.equal(err.status, 404);
              done();
            });
          });
        });

        describe('a get request to /v1/:model', function() {

          it('should return a 404', function(done) {
            sailsApp.request('get /v1/user', function (err, resp, data) {
              assert(err);
              assert.equal(err.status, 404);
              done();
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

        it('if a `:model.find` action is explicitly added, it should be used in response to `GET /:model`', function(done) {
          sailsApp.models.user.create({name: 'al'}).exec(function(err) {
            if (err) {return done (err);}
            sailsApp.request('get /user', function (err, resp, data) {
              assert(!err, err);
              assert.equal(data, 'find dem users!');
              done();
            });
          });
        });


      });

    });

  });

});
