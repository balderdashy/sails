var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var request = require('request');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

describe('Starting sails server with lift', function() {
	var sailsBin = './bin/sails.js';
	var appName = 'testApp';
	var sailsServer;

	before(function() {
		if (fs.existsSync(appName)) {
			wrench.rmdirSyncRecursive(appName);
		}
	});

	after(function() {
		if (fs.existsSync(appName)) {
			wrench.rmdirSyncRecursive(appName);
		}
	});

	describe('in an empty directory', function() {

		before(function() {
			// Make empty folder and move into it
			fs.mkdirSync('empty');
			process.chdir('empty');
			sailsBin = '.' + sailsBin;
		});

		after(function() {
			// Delete empty folder and move out of it
			process.chdir('../');
			fs.rmdirSync('empty');
			sailsBin = sailsBin.substr(1);
		});

		it('should throw an error', function(done) {

			sailsServer = spawn(sailsBin, ['lift']);

			sailsServer.stderr.on('data', function(data) {
				var dataString = data + '';
				assert(dataString.indexOf('error') !== -1);
				sailsServer.stderr.removeAllListeners('data');
				sailsServer.kill();
				done();
			});
		});
	});

	describe('in an sails app directory', function() {

		it('should start server without error', function(done) {

			exec(sailsBin + ' new ' + appName, function(err) {
				if (err) done(new Error(err));

				// Move into app directory
				process.chdir(appName);
				sailsBin = '.' + sailsBin;

				sailsServer = spawn(sailsBin, ['lift']);

				sailsServer.stdout.on('data', function(data) {					
					var dataString = data + '';
					assert(dataString.indexOf('error') === -1);
					sailsServer.stdout.removeAllListeners('data');
					sailsServer.kill();
					// Move out of app directory
					process.chdir('../');
					done();
				});
			});
		});

		it('should respond to a request to port 1337 with a 200 status code', function(done) {
			process.chdir(appName);
			sailsServer = spawn(sailsBin, ['lift']);
			sailsServer.stdout.on('data', function(data){
				var dataString = data + '';
				// Server has finished starting up
				if (dataString.match(/Server lifted/)) {
					sailsServer.stdout.removeAllListeners('data');
					setTimeout(function(){
						request('http://localhost:1337/', function(err, response) {
							if (err) {
								sailsServer.kill();
								done(new Error(err));
							}

							assert(response.statusCode === 200);
							sailsServer.kill();
							process.chdir('../');
							done();
						});
					},1000);
				}
			});
		});
	});

	describe('with command line arguments', function() {
		afterEach(function() {
			sailsServer.stderr.removeAllListeners('data');
			sailsServer.kill();
			process.chdir('../');
		});

		it('--prod and --dev should throw an error', function(done) {

			// Move into app directory
			process.chdir(appName);

			sailsServer = spawn(sailsBin, ['lift', '--dev', '--prod']);

			sailsServer.stderr.on('data', function(data) {
				var dataString = data + '';
				assert(dataString.indexOf('error') !== -1);

				// Move out of app directory
				done();
			});
		});

		it('--prod should change the environemnt to production', function(done) {

			// Move into app directory
			process.chdir(appName);

			// Overrwrite session config file
			// to set session adapter:null ( to prevent warning message from appearing on command line )
			fs.writeFileSync('config/session.js', 'module.exports.session = { adapter: null }');


			sailsServer = spawn(sailsBin, ['lift', '--prod']);

			sailsServer.stderr.on('data', function(data) {
				var dataString = data + '';
				if (dataString.indexOf('production') !== -1) {

					done();
				}
			});
		});

		it('--dev should change the environemnt to development', function(done) {

			// Move into app directory
			process.chdir(appName);

			// Change environment to production in config file
			fs.writeFileSync('config/application.js', 'module.exports = ' + JSON.stringify({
				appName: 'Sails Application',
				port: 1337,
				environment: 'production',
				log: {
					level: 'info'
				}
			}));

			sailsServer = spawn(sailsBin, ['lift', '--dev']);

			sailsServer.stderr.on('data', function(data) {
				var dataString = data + '';
				if (dataString.indexOf('development') !== -1) {

					done();
				}
			});
		});
	});
});
