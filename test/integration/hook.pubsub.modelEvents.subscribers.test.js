/**
 * Test dependencies
 */

var util = require('util');
var path = require('path');
var _ = require('@sailshq/lodash');
var assert = require('assert');
var async = require('async');
var socketHelper = require('./helpers/socketHelper.js');
var appHelper = require('./helpers/appHelper');
var fs = require('fs-extra');


/**
 * Errors
 */
var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response);
  }
};


describe('pubsub :: ', function() {

  describe('Model events', function() {

    describe('when a socket is watching Users ', function() {
      var socket1;
      var socket2;
      var appName = 'testApp';
      var sailsApp;
      var bootstrapModels = {};
      var bootstrappedData = {};

      before(appName, function(done) {
        appHelper.build(done);
      });

      beforeEach(function (done) {
        appHelper.liftWithTwoSockets({
          log: {level: 'warn'},
          models: {
            migrate: 'drop'
          }
        }, function(err, sails, _socket1, _socket2) {
          if (err) {
            return done(err);
          }
          sailsApp = sails;
          socket1 = _socket1;
          socket2 = _socket2;

          async.eachSeries(_.keys(bootstrapModels), function(model, nextModel) {
            sailsApp.models[model].createEach(bootstrapModels[model]).meta({fetch: true}).exec(function(err, records) {
              if (err) {
                return nextModel(err);
              }
              bootstrappedData[model] = records;
              return nextModel();
            });
          }, function(err) {
            if (err) {return done(err);}
            // Subscribe to all users and new user notifications.
            socket1.get('/user', function(body, jwr) {
              if (jwr.error) { return done(new Error('Error in tests.  Details:' + JSON.stringify(jwr))); }
              // Subscribe to all pets and new pet notifications.
              socket1.get('/pet', function(body, jwr) {
                if (jwr.error) { return done(new Error('Error in tests.  Details:' + JSON.stringify(jwr))); }
                done();
              });
            });
          });
        });
      });

      afterEach(function(done) {
        bootstrapModels = {};
        bootstrappedData = {};
        socket1.removeAllListeners();
        socket2.removeAllListeners();
        var dir = path.resolve('.tmp', 'localDiskDb');
        if (fs.existsSync(dir)) {
          fs.removeSync(dir);
        }
        setTimeout(function(){sailsApp.lower(done);},100);
      });

      after(function(done) {
        // Add a delay before killing the app to account for any queries that
        // haven't been run by the blueprints yet; otherwise they might casue an error
        setTimeout(function() {
          process.chdir('../');
          appHelper.teardown(appName);
          return done();
        }, 500);

      });//</after>

      //   ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
      //  ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
      //  ██║     ██████╔╝█████╗  ███████║   ██║   █████╗
      //  ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝
      //  ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
      //   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

      describe('creating a new user with POST /user', function() {
        it('should cause a `created` notification to be received by all `user` subscribers', function(done) {

          expectNotifications({
            user: {
              created: {
                verb: 'created',
                id: 1,
                'data.name': 'bert'
              }
            }
          }, done);

          socket2.post('/user', { name: 'bert' }, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });

        });
      });

      describe('creating a new pet with POST /pet that includes a value for a singular association in a one-to-many relationship', function () {

        before(function() {
          bootstrapModels = {
            user: [{name: 'bob'}]
          };
        });

        it('should cause an `addedTo` notification to be received by all subscribers to the child record', function(done) {

          expectNotifications({
            pet: {
              created: {
                verb: 'created',
                id: 1,
                'data.name': 'alice'
              }
            },
            user: {
              addedTo: {
                verb: 'addedTo',
                id: 1,
                addedId: 1,
                attribute: 'pets'
              }
            }
          }, done);

          socket2.post('/pet', { name: 'alice', owner: 1 }, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });


        });
      });

      describe('creating a new user with POST /user that includes a value for a plural association in a many-to-one relationship', function () {

        describe('and the other side was not already linked to a record', function() {

          before(function() {
            bootstrapModels = {
              pet: [{ name: 'alice'}, {name: 'mr. bailey'}, {name: 'tex'}]
            };
          });

          it('should cause an `updated` notification to be received by all subscribers to the child record', function(done) {

            expectNotifications({
              user: {
                created: {
                  verb: 'created',
                  id: 1,
                  'data.name': 'bert'
                }
              },
              pet: {
                updatedAlice: {
                  verb: 'updated',
                  id: 1,
                  'data.owner': 1
                },
                updatedBailey: {
                  verb: 'updated',
                  id: 2,
                  'data.owner': 1
                },
                updatedTex: {
                  verb: 'updated',
                  id: 3,
                  'data.owner': 1
                }
              }
            }, done);

            socket2.post('/user', { name: 'bert', pets: [1, 2, 3] }, function (body, jwr) {
              if (jwr.error) { return done(jwr.error); }
              // Otherwise, the event handler above should fire (or this test will time out and fail).
            });

          });

        });

        describe('and the other side was already linked to a record', function() {

          before(function() {
            bootstrapModels = {
              user: [{ name: 'bert' }],
              pet: [{ name: 'alice', owner: 1}, {name: 'mr. bailey'}, {name: 'tex', owner: 1}]
            };
          });

          it('should cause an `updated` notification to be received by all subscribers to the child record, and a `removedFrom` notification to be received by all subscribers to the child\'s former parent record', function(done) {

            expectNotifications({
              user: {
                created: {
                  verb: 'created',
                  id: 2,
                  'data.name': 'ernie'
                },
                removedAlice: {
                  verb: 'removedFrom',
                  id: 1,
                  removedId: 1,
                  attribute: 'pets'
                },
                removedText: {
                  verb: 'removedFrom',
                  id: 1,
                  removedId: 3,
                  attribute: 'pets'
                }
              },
              pet: {
                updatedAlice: {
                  verb: 'updated',
                  id: 1,
                  'data.owner': 2
                },
                updatedBailey: {
                  verb: 'updated',
                  id: 2,
                  'data.owner': 2
                },
                updatedTex: {
                  verb: 'updated',
                  id: 3,
                  'data.owner': 2
                }
              }
            }, done);

            socket2.post('/user', { name: 'ernie', pets: [1, 2, 3] }, function (body, jwr) {
              if (jwr.error) { return done(jwr.error); }
              // Otherwise, the event handler above should fire (or this test will time out and fail).
            });
          });

        });

      });


      describe('creating a new user with POST /user that includes a value for a plural association in a many-to-many relationship', function () {

        before(function() {
          bootstrapModels = {
            pet: [{ name: 'alice' }, {name: 'mr. bailey'}, {name: 'tex' }]
          };
        });

        it('should cause an `addedTo` notification to be received by all subscribers to the child record', function(done) {

          expectNotifications({
            user: {
              created: {
                verb: 'created',
                id: 1,
                'data.name': 'bert'
              }
            },
            pet: {
              addedToAlice: {
                verb: 'addedTo',
                attribute: 'vets',
                id: 1,
                addedId: 1
              },
              addedToBailey: {
                verb: 'addedTo',
                attribute: 'vets',
                id: 2,
                addedId: 1
              },
              addedToTex: {
                verb: 'addedTo',
                attribute: 'vets',
                id: 3,
                addedId: 1
              }
            }
          }, done);

          socket2.post('/user', { name: 'bert', patients: [1, 2, 3] }, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });

        });

      });

      //  ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗
      //  ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
      //  ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗
      //  ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝
      //  ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗
      //   ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
      //

      describe('updating a record with PATCH /user', function() {

        before(function() {
          bootstrapModels = {
            user: [{ name: 'bert' }]
          };
        });

        it('should cause an `updated` notification to be received by all subscribers to the parent record', function(done) {

          expectNotifications({
            user: {
              updated: {
                verb: 'updated',
                id: 1,
                'data.name': 'ernie',
                'previous.name': 'bert'
              }
            }
          }, done);

          socket2.patch('/user/1', { name: 'ernie' }, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });


        });

      });

      describe('updating a record with PUT /pet with a new value for a singular association', function() {

        describe('where the previous value was `null`', function() {

          before(function() {
            bootstrapModels = {
              user: [{ name: 'bert' }],
              pet: [{name: 'alice', owner: null}]
            };
          });

          it('should cause an `addedTo` notification to be sent to all subscribers to the new parent record', function(done) {

            expectNotifications({
              pet: {
                updated: {
                  verb: 'updated',
                  id: 1,
                  'data.owner': 1,
                  'previous.owner': null
                }
              },
              user: {
                addedTo: {
                  verb: 'addedTo',
                  id: 1,
                  attribute: 'pets',
                  addedId: 1
                }
              }
            }, done);

            socket2.patch('/pet/1', { owner: 1 }, function (body, jwr) {
              if (jwr.error) { return done(jwr.error); }
              // Otherwise, the event handler above should fire (or this test will time out and fail).
            });

          });


        });

        describe('where the previous value was not `null`', function() {

          before(function() {
            bootstrapModels = {
              user: [{ name: 'bert' }, {name: 'ernie'}],
              pet: [{name: 'alice', owner: 1}]
            };
          });

          it('should cause a `removedFrom` notification to be sent to all subscribers to the old parent record', function(done) {

            expectNotifications({
              pet: {
                updated: {
                  verb: 'updated',
                  id: 1,
                  'data.owner': 2,
                  'previous.owner.user_id': 1
                }
              },
              user: {
                addedTo: {
                  verb: 'addedTo',
                  id: 2,
                  attribute: 'pets',
                  addedId: 1
                },
                removedFrom: {
                  verb: 'removedFrom',
                  id: 1,
                  attribute: 'pets',
                  removedId: 1
                }
              }

            }, done);

            socket2.patch('/pet/1', { owner: 2 }, function (body, jwr) {
              if (jwr.error) { return done(jwr.error); }
              // Otherwise, the event handler above should fire (or this test will time out and fail).
            });

          });

        });

      });

      //   █████╗ ██████╗ ██████╗
      //  ██╔══██╗██╔══██╗██╔══██╗
      //  ███████║██║  ██║██║  ██║
      //  ██╔══██║██║  ██║██║  ██║
      //  ██║  ██║██████╔╝██████╔╝
      //  ╚═╝  ╚═╝╚═════╝ ╚═════╝
      //

      describe('adding a pet to a user with PUT /user/1/pets/1 where pets->owner is a many-to-one relationship', function () {

        describe('and the other side was not already linked to a record', function() {

          before(function() {
            bootstrapModels = {
              user: [{name: 'bert'}],
              pet: [{ name: 'alice'}]
            };
          });

          it('should cause an `addedTo` notification to be received by all subscribers to the parent record, and an `updated` notification to be received by all subscribers to the child record', function(done) {

            expectNotifications({
              user: {
                addedTo: {
                  verb: 'addedTo',
                  id: 1,
                  attribute: 'pets',
                  addedId: 1
                }
              },
              pet: {
                updatedAlice: {
                  verb: 'updated',
                  id: 1,
                  'data.owner': 1
                }
              }
            }, done);

            socket2.put('/user/1/pets/1', {}, function (body, jwr) {
              if (jwr.error) { return done(jwr.error); }
              // Otherwise, the event handler above should fire (or this test will time out and fail).
            });

          });

        });

        describe('and the other side was already linked to a record', function() {

          before(function() {
            bootstrapModels = {
              user: [{ name: 'bert' }, { name: 'ernie' }],
              pet: [{ name: 'alice', owner: 1}]
            };
          });

          it('should cause an `updated` notification to be received by all subscribers to the child record, and a `removedFrom` notification to be received by all subscribers to the child\'s former parent record', function(done) {

            expectNotifications({
              user: {
                addedTo: {
                  verb: 'addedTo',
                  id: 2,
                  attribute: 'pets',
                  addedId: 1
                },
                removedFrom: {
                  verb: 'removedFrom',
                  id: 1,
                  removedId: 1,
                  attribute: 'pets'
                }
              },
              pet: {
                updatedAlice: {
                  verb: 'updated',
                  id: 1,
                  'data.owner': 2
                }
              }
            }, done);

            socket2.put('/user/2/pets/1', {}, function (body, jwr) {
              if (jwr.error) { return done(jwr.error); }
              // Otherwise, the event handler above should fire (or this test will time out and fail).
            });
          });

        });

      });


      describe('adding a patient to a user with PUT /user/1/patients/1 where patients->vets is a many-to-many relationship', function () {

        before(function() {
          bootstrapModels = {
            user: [{name: 'bert'}],
            pet: [{ name: 'alice' }]
          };
        });

        it('should cause an `addedTo` notification to be received by all subscribers to the child record', function(done) {

          expectNotifications({
            pet: {
              addedTo: {
                verb: 'addedTo',
                id: 1,
                attribute: 'vets',
                addedId: 1
              }
            },
            user: {
              addedTo: {
                verb: 'addedTo',
                id: 1,
                attribute: 'patients',
                addedId: 1
              }
            }

          }, done);

          socket2.put('/user/1/patients/1', {}, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });

        });

      });

      //  ██████╗ ███████╗███╗   ███╗ ██████╗ ██╗   ██╗███████╗
      //  ██╔══██╗██╔════╝████╗ ████║██╔═══██╗██║   ██║██╔════╝
      //  ██████╔╝█████╗  ██╔████╔██║██║   ██║██║   ██║█████╗
      //  ██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝
      //  ██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗
      //  ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝
      //

      describe('removing a pet from a user with DELETE /user/1/pets/1 where pets->owner is a many-to-one relationship', function () {

        before(function() {
          bootstrapModels = {
            user: [{ name: 'bert' }],
            pet: [{ name: 'alice', owner: 1}]
          };
        });

        it('should cause a `removedFrom` notification to be received by all subscribers to the parent record, and an `updated` notification to be received by all subscribers to the child record', function(done) {

          expectNotifications({
            user: {
              removedFrom: {
                verb: 'removedFrom',
                id: 1,
                attribute: 'pets',
                removedId: 1
              },
            },
            pet: {
              updatedAlice: {
                verb: 'updated',
                id: 1,
                'data.owner': null
              }
            }
          }, done);

          socket2.delete('/user/1/pets/1', {}, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });
        });

      });

      describe('removing a patient from a user with DELETE /user/1/patients/1 where patients->vets is a many-to-many relationship', function () {

        before(function() {
          bootstrapModels = {
            user: [{name: 'bert'}],
            pet: [{ name: 'alice', vets: [1] }]
          };
        });

        it('should cause a `removedFrom` notification to be received by all subscribers to the child record', function(done) {

          expectNotifications({
            pet: {
              removedFrom: {
                verb: 'removedFrom',
                id: 1,
                attribute: 'vets',
                removedId: 1
              }
            },
            user: {
              removedFrom: {
                verb: 'removedFrom',
                id: 1,
                attribute: 'patients',
                removedId: 1
              }
            }

          }, done);

          socket2.delete('/user/1/patients/1', {}, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });

        });

      });

      //  ██████╗ ███████╗██████╗ ██╗      █████╗  ██████╗███████╗
      //  ██╔══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔════╝██╔════╝
      //  ██████╔╝█████╗  ██████╔╝██║     ███████║██║     █████╗
      //  ██╔══██╗██╔══╝  ██╔═══╝ ██║     ██╔══██║██║     ██╔══╝
      //  ██║  ██║███████╗██║     ███████╗██║  ██║╚██████╗███████╗
      //  ╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝
      //

      describe('replacing pets of a user with PUT /user/1/pets where pets->owner is a many-to-one relationship', function () {

        describe('and some of the replacement pets were already linked to owners', function() {

          before(function() {
            bootstrapModels = {
              user: [{ name: 'bert' }, { name: 'ernie' }],
              pet: [{ name: 'alice', owner: 1}, {name: 'mr. bailey', owner: 2}, {name: 'tex'}]
            };
          });

          it('should cause an `updated` notification to be received by all subscribers to the replacement child records, an `addedTo` notification to be received by all subscribers to the new parent record, a `removedFrom` notification to be received by all subscribers to the new parent record (about replaced children) and a `removedFrom` notification to be received by all subscribers to any "stolen" child\'s former parent record', function(done) {

            expectNotifications({
              user: {
                addedMrBailey: {
                  verb: 'addedTo',
                  id: 1,
                  attribute: 'pets',
                  addedId: 2
                },
                addedTex: {
                  verb: 'addedTo',
                  id: 1,
                  attribute: 'pets',
                  addedId: 3
                },
                removedAlice: {
                  verb: 'removedFrom',
                  id: 1,
                  removedId: 1,
                  attribute: 'pets'
                },
                removedBailey: {
                  verb: 'removedFrom',
                  id: 2,
                  removedId: 2,
                  attribute: 'pets'
                },
              },
              pet: {
                updatedAlice: {
                  verb: 'updated',
                  id: 1,
                  'data.owner': null
                },
                updatedBailey: {
                  verb: 'updated',
                  id: 2,
                  'data.owner': 1
                },
                updatedTex: {
                  verb: 'updated',
                  id: 3,
                  'data.owner': 1
                },

              }
            }, done);

            socket2.put('/user/1/pets', [2,3], function (body, jwr) {
              if (jwr.error) { return done(jwr.error); }
              // Otherwise, the event handler above should fire (or this test will time out and fail).
            });
          });

        });

      });


      describe('replacing patients of a user with PUT /user/1/patients where patients->vets is a many-to-many relationship', function () {

        before(function() {
          bootstrapModels = {
            pet: [{ name: 'alice' }, { name: 'mr. bailey'}, {name: 'tex'}],
            user: [{name: 'bert', patients: [1,2]}],
          };
        });

        it('should cause an `updated` notification to be received by all subscribers to the replacement child records, an `addedTo` notification to be received by all subscribers to the new parent record, and a `removedFrom` notification to be received by all subscribers to the new parent record (about replaced children)', function(done) {

          expectNotifications({
            pet: {
              addedTex: {
                verb: 'addedTo',
                id: 3,
                attribute: 'vets',
                addedId: 1
              },
              removedAlice: {
                verb: 'removedFrom',
                id: 1,
                attribute: 'vets',
                removedId: 1
              }
            },
            user: {
              addedTex: {
                verb: 'addedTo',
                id: 1,
                attribute: 'patients',
                addedId: 3
              },
              removedAlice: {
                verb: 'removedFrom',
                id: 1,
                attribute: 'patients',
                removedId: 1
              }
            }

          }, done);

          socket2.put('/user/1/patients', [2,3], function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });

        });

      });

      //  ██████╗ ███████╗███████╗████████╗██████╗  ██████╗ ██╗   ██╗
      //  ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗╚██╗ ██╔╝
      //  ██║  ██║█████╗  ███████╗   ██║   ██████╔╝██║   ██║ ╚████╔╝
      //  ██║  ██║██╔══╝  ╚════██║   ██║   ██╔══██╗██║   ██║  ╚██╔╝
      //  ██████╔╝███████╗███████║   ██║   ██║  ██║╚██████╔╝   ██║
      //  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝
      //

      describe('destroying a user with DELETE /user/1 where the user has pets and pets->owner is a many-to-one relationship', function () {

        before(function() {
          bootstrapModels = {
            user: [{ name: 'bert' }],
            pet: [{ name: 'alice', owner: 1}]
          };
        });

        it('should cause a `destroyed` notification to be received by all subscribers to the parent record, and an `updated` notification to be received by all subscribers to the child records', function(done) {

          expectNotifications({
            user: {
              destroyed: {
                verb: 'destroyed',
                id: 1,
              },
            },
            pet: {
              updatedAlice: {
                verb: 'updated',
                id: 1,
                'data.owner': null
              }
            }
          }, done);

          socket2.delete('/user/1', {}, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });
        });

      });

      describe('destroying a user with DELETE /user/1 where the user has patients and patients->vets is a many-to-many relationship', function () {

        before(function() {
          bootstrapModels = {
            user: [{name: 'bert'}],
            pet: [{ name: 'alice', vets: [1] }]
          };
        });

        it('should cause a `removedFrom` notification to be received by all subscribers to the child record', function(done) {

          expectNotifications({
            user: {
              destroyed: {
                verb: 'destroyed',
                id: 1
              }
            },
            pet: {
              removedFrom: {
                verb: 'removedFrom',
                id: 1,
                attribute: 'vets',
                removedId: 1
              }
            }

          }, done);

          socket2.delete('/user/1', {}, function (body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });

        });

      });

      function expectNotifications(notifications, done) {
        var checklist = {};
        var errored = false;
        _.each(notifications, function(modelNotifications, model) {
          _.each(modelNotifications, function(validator, identifier) {
            checklist[model + '.' + identifier] = false;
          });
          socket1.on(model, function(notification){
            // console.log(notification);
            if (errored) {return;}
            try {
              if (!_.any(modelNotifications, function(validator, identifier) {
                if (_.all(validator, function(val, path) {
                  return _.get(notification, path) === val;
                })) {
                  if (checklist[model + '.' + identifier] === true) {
                    errored = true;
                    throw new Error('Got duplicate `' + identifier + '` notification for model `' + model + '`' );
                  }
                  checklist[model + '.' + identifier] = true;
                  if (_.all(checklist, function(flag) {
                    return flag === true;
                  })) {
                    done();
                  }
                  return true;
                }
              })) {
                throw new Error('Unexpected `' + model + '` notification: ' + util.inspect(notification, {depth: null}));
              }
            } catch (e) {
              errored = true;
              return done(e);
            }
          });
        });
      }

    });//</describe>
  });//</describe :: Model events>
});//</describe :: pubsub>
