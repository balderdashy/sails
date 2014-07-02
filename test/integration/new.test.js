/**
 * Module dependencies
 */
var assert	= require('assert'),
	fs		= require('fs'),
	wrench	= require('wrench'),
	exec	= require('child_process').exec,
	_		= require('lodash'),
	appHelper = require('./helpers/appHelper'),
	util	= require('util');




/**
 * Module errors
 */

describe('New app generator', function() {
	var sailsbin = './bin/sails.js';
	var appName = 'testApp';
	var defaultTemplateLang = 'ejs';

	this.slow(1000);

	beforeEach(function(done) {
		fs.exists(appName, function(exists) {
			if (exists) {
				wrench.rmdirSyncRecursive(appName);
			}
			done();
		});
	});

	afterEach(function(done) {
		fs.exists(appName, function(exists) {
			if (exists) {
				wrench.rmdirSyncRecursive(appName);
			}
			done();
		});
	});

	describe('sails new <appname>', function() {

		it('should create new, liftable app in new folder', function(done) {
			exec(sailsbin + ' new ' + appName, function(err) {
				if (err) { return done(new Error(err)); }
				appHelper.lift({log:{level:'silent'}}, function(err, sailsprocess) {					
					if (err) {return done(err);}
					sailsprocess.once('hook:http:listening', function(){sailsprocess.kill(done);});
					// sailsprocess.kill(done);
					// setTimeout(done, function(){sailsprocess.kill(done)});
				});
			});
		});

		it('should not overwrite a folder', function(done) {
			exec('mkdir ' + appName, function(err) {
				if (err) { return done(new Error(err)); }
				exec('touch '+appName+'/test', function(err) {
					if (err) { return done(new Error(err)); }
					exec(sailsbin + ' new ' + appName, function(err, dumb, result) {
						assert.notEqual(result.indexOf('error'), -1);
						done();
					});
				});
			});
		});
	});

	describe('sails generate new <appname>', function() {

		it('should create new app', function(done) {
			exec(sailsbin + ' generate new ' + appName, function(err) {
				if (err) { return done(new Error(err)); }
				appHelper.lift({log:{level:'silent'}}, function(err, sailsprocess) {
					if (err) {return done(err);}
					sailsprocess.once('hook:http:listening', function(){sailsprocess.kill(done);});
				});
			});
		});

		it('should not overwrite a folder', function(done) {
			exec('mkdir ' + appName, function(err) {
				if (err) { return done(new Error(err)); }
				exec('touch '+appName+'/test', function(err) {
					if (err) { return done(new Error(err)); }
					exec(sailsbin + ' generate new ' + appName, function(err, dumb, result) {
						assert.notEqual(result.indexOf('error'), -1);
						done();
					});
				});
			});
		});
	});

	describe('sails new .', function() {

		it('should create new app in existing folder', function(done) {

			// make app folder and move into directory
			fs.mkdirSync(appName);
			process.chdir(appName);

			exec( '.' + sailsbin + ' new .', function(err) {
				if (err) { return done(new Error(err)); }

				// move from app to its parent directory
				process.chdir('../');

				done();
			});
		});

		it('should not overwrite a folder', function(done) {
			exec('mkdir ' + appName, function(err) {
				if (err) { return done(new Error(err)); }

				exec( '.' + sailsbin + ' new ' + appName, function(err) {
					assert.equal(err.code, 127); // Command fails
					done();
				});
			});
		});
	});

	describe('sails new with no template option', function() {

		it('should create new app with ejs templates', function(done) {

			exec(sailsbin + ' new ' + appName, function(err) {
				if (err) { return done(new Error(err)); }

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('ejs') !== -1, 'configuration file is incorrect');
				done();
			});
		});
	});

	describe('sails new <appname> with options --template=ejs', function() {

		it('should create new app with ejs templates', function(done) {

			exec(sailsbin + ' new ' + appName + ' --template=ejs', function(err) {
				if (err) { return done(new Error(err)); }

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('ejs') !== -1, 'configuration file is incorrect');
				done();
			});
		});
	});

	describe('sails new <appname> with options --template=jade', function() {

		it('should create new app with jade templates', function(done) {

			exec(sailsbin + ' new ' + appName + ' --template=jade', function(err) {
				if (err) { return done(new Error(err)); }

				var viewConfig = fs.readFileSync('./' + appName + '/config/views.js', 'utf8');
				assert(viewConfig.indexOf('jade') !== -1, 'configuration file is incorrect');
				done();
			});
		});
	});
});

