var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var request = require('request');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

describe('Running sails www', function() {
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

	});

	describe('in a sails app directory', function() {

		it('should start server without error', function(done) {

			exec(sailsBin + ' new ' + appName, function(err) {
				if (err) done(new Error(err));
				// Move into app directory
				process.chdir(appName);
				sailsBin = '.' + sailsBin;

				sailsServer = spawn(sailsBin, ['www']);

        sailsServer.stderr.on('data', function (data) {
          return done(data);
        });

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

	});

	describe('with command line arguments', function() {
		afterEach(function() {
			sailsServer.stderr.removeAllListeners('data');
			sailsServer.kill();
			process.chdir('../');
		});

	});
});
