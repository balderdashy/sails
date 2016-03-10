var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var request = require('request');
var exec = require('child_process').exec;
var path = require('path');
var spawn = require('child_process').spawn;

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

describe('Running sails www', function() {
	var sailsBin = path.resolve('./bin/sails.js');
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
			sailsBin = path.resolve('..', sailsBin);
		});

		after(function() {
			// Delete empty folder and move out of it
			process.chdir('../');
			fs.rmdirSync('empty');
			sailsBin = path.resolve(sailsBin);
		});

	});

	describe('in a sails app directory', function() {

		it('should start server without error', function(done) {

			exec('node ' + sailsBin + ' new ' + appName, function(err) {
				if (err) done(new Error(err));
				// Move into app directory
				process.chdir(appName);
				sailsBin = path.resolve('..', sailsBin);

				sailsServer = spawn('node', [sailsBin, 'www']);

        sailsServer.stderr.on('data', function (data) {
          return done(data);
        });

				sailsServer.stdout.on('data', function(data) {
					var dataString = data + '';
					assert(dataString.indexOf('error') === -1);
					sailsServer.stdout.removeAllListeners('data');
          // Move out of app directory
          process.chdir('../');
					sailsServer.kill();
          return done();
				});
			});
		});

	});

	describe('with command line arguments', function() {
		afterEach(function(done) {
			sailsServer.stderr.removeAllListeners('data');
      process.chdir('../');
      sailsServer.kill();
      return done();
		});

		it('--dev should execute grunt build', function(done) {

			// Move into app directory
			process.chdir(appName);

			// Change environment to production in config file
			fs.writeFileSync('config/application.js', 'module.exports = ' + JSON.stringify({
				appName: 'Sails Application',
				port: 1342,
				environment: 'production',
				log: {
					level: 'info'
				}
			}));

			sailsServer = spawn('node', [sailsBin, 'www', '--dev']);

			sailsServer.stdout.on('data', function(data) {
				var dataString = data + '';
				if (dataString.indexOf("`grunt build`") !== -1) {

					done();
				}
			});
		});

		it('--prod should execute grunt buildProd', function(done) {

			// Move into app directory
			process.chdir(appName);

			// Overrwrite session config file
			// to set session adapter:null ( to prevent warning message from appearing on command line )
			fs.writeFileSync('config/session.js', 'module.exports.session = { adapter: null }');

			sailsServer = spawn('node', [sailsBin, 'www', '--prod']);

			sailsServer.stdout.on('data', function(data) {
				var dataString = data + '';
				if (dataString.indexOf("`grunt buildProd`") !== -1) {

					done();
				}
			});
		});
	});
});
