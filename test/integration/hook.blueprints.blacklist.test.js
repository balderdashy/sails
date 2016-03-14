/**
 * Test dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');
var async = require('async');
var fixture = require('./fixtures/users.js');
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var Sails = require('../../lib/app');




describe('blueprints :: ', function() {

  describe('using the values blacklist ::', function() {

    describe('updating a model with a non-primary-key "id" attribute', function() {

      before(function(done) {
        // Build the app
        appHelper.build(function(err) {
          if (err) { return done(err); }

          var Goal = {
            attributes: {
              hash: {
                type: 'string',
                unique: true,
                primaryKey: true
              },
              id: 'integer',
              active: 'boolean'
            }
          };

          fs.outputFileSync(path.resolve(__dirname,'../../testApp/api/models/Goal.js'), 'module.exports = ' + JSON.stringify(Goal) + ';');
          fs.outputFileSync(path.resolve(__dirname,'../../testApp/api/controllers/GoalController.js'), 'module.exports = {};');
          return done();
        });
      });


      var sails = Sails();

      before(function(done) {
        sails.load({
          hooks: {
            grunt: false
          },
          globals: false,
          log: {
            level: 'silent'
          }
        }, function(err) {
          if (err) {return done(err);}
          sails.models.goal.create({id: 1, hash: 'abc', active: false}).exec(done);
        });
      });


      it('should update the record successfully', function(done) {
        sails.request('put /goal/abc', {active: true}, function(err, response, body) {
          if (err) {return done(err);}
          assert.equal (response.statusCode, 200);
          assert.equal(body.id, 1);
          assert.equal(body.hash, 'abc');
          assert.equal(body.active, true);
          return done();
        });
      });

      after(function(done) {
        sails.lower(function(err){
          if (err) {return done(err);}
          setTimeout(done, 100);
        });
      });//</after>

      after(function(done) {
        process.chdir('../');
        appHelper.teardown();
        return done();
      });//</after>
    });//</describe(updating a model with a non-primary-key "id" attribute)>
  });//</describe>
});//</describe>


