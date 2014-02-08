/**
 * Test dependencies
 */
var assert = require('assert');
var socketHelper = require('./helpers/socketHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');

/**
 * Errors
 */
var Err = {
	badResponse: function(response) {
		return 'Wrong server response!  Response :::\n' + util.inspect(response);
	}
};


describe('pubsub :: ', function() {

	var sailsprocess;
	var socket1;
	var socket2;
	var appName = 'testApp';

	describe('Model events (i.e. not the firehose)', function() {


		describe('when a socket is watching Users ', function() {

			before(function(done) {
				appHelper.buildAndLiftWithTwoSockets(appName, {verbose: false}, function(err, sails, _socket1, _socket2) {
					if (err) {throw new Error(err);}
					sailsprocess = sails;
					socket1 = _socket1;
					socket2 = _socket2;
					socket2.get('/user/watch', function(){done();});
				});
			});

			after(function() {

				socket1.disconnect();				
				socket2.disconnect();

				if (sailsprocess) {
					sailsprocess.kill();
				}
				// console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
				process.chdir('../');
				// console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
				appHelper.teardown();
			});

			afterEach(function(done) {
				socket1.removeAllListeners();
				socket2.removeAllListeners();
				done();
			});

			it('a post request to /user should result in the socket watching User getting a `user` event', function(done) {

				socket2.on('user', function(message) {
					assert(message.id === 1 && message.verb == 'created' && message.data.name == 'scott', Err.badResponse(message));
					done();
				})
				socket1.post('/user', {name:'scott'});

			});

			it('hitting the custom /userMessage route should result in a correct `user` event being received by all subscribers', function(done) {
				socket2.on('user', function(message) {
					assert(message.id === 1 && message.verb == 'messaged' && message.message.greeting == 'hello', Err.badResponse(message));
					done();
				})
				socket1.get('/user/message', function(){});

			});

			it('updating the user via PUT /user/1 should result a correct `user` event being received by all subscribers', function(done) {
				
				socket2.on('user', function(message) {
					assert(message.id == 1 && message.verb == 'updated' && message.data.name == 'joe' && message.previous.name == 'scott', Err.badResponse(message));
					done();
				})

				socket1.put('/user/1', {name:'joe'});

			});

			it ('adding a pet to the user via POST /pet should result a correct `user` event being received by all subscribers', function(done) {

				socket2.on('user', function(message) {
					assert(message.id == 1 
						&& message.verb == 'addedTo' 
						&& message.attribute == 'pets' 
						&& message.addedId == 1, Err.badResponse(message));
					done();
				});

				socket1.post('/pet', {name:'rex', owner: 1});

			});

			it ('removing a pet from the user via PUT /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

				socket2.on('user', function(message) {
					assert(message.id == 1 
						&& message.verb == 'removedFrom' 
						&& message.attribute == 'pets' 
						&& message.removedId == 1, Err.badResponse(message));
					done();
				})

				socket1.put('/pet/1', {owner: null});

			});

			it ('adding a pet from the user via PUT /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

				socket2.on('user', function(message) {
					assert(message.id == 1 
						&& message.verb == 'addedTo' 
						&& message.attribute == 'pets' 
						&& message.addedId == 1, Err.badResponse(message));
					done();
				})

				socket1.put('/pet/1', {owner: 1});

			});

			it ('removing the user from the pet via DELETE /user/1/pets should result a correct `pet` event being received by all subscribers', function(done) {

				socket1.on('pet', function(message) {
					assert(message.id == 1 
						&& message.verb == 'updated' 
						&& message.data.owner == null
						, Err.badResponse(message));
					done();
				})

				socket2.delete('/user/1/pets', {id:1});

			});

			it ('adding a user to the pet via POST /user/1/pets should result a correct `pet` event being received by all subscribers', function(done) {

				socket1.on('pet', function(message) {
					assert(message.id == 1 
						&& message.verb == 'updated' 
						&& message.data.owner == 1
						, Err.badResponse(message));
					done();
				})

				socket2.post('/user/1/pets', {id:1});

			});

			it ('removing a pet from the user via DELETE /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

				socket2.on('user', function(message) {					
					assert(message.id == 1 
						&& message.verb == 'removedFrom' 
						&& message.attribute == 'pets' 
						&& message.removedId == 1, Err.badResponse(message));
					done();
				})

				socket1.delete('/pet/1');

			});

		});

	});
});