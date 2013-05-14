//	assets.js
// --------------------
//
// Manage bundling/inclusion/compilation of assets
// Includes support for CSS, LESS, js, & CoffeeScript

var _ = require('underscore');
_.str = require('underscore.string');
var async = require('async');
var rack = require('asset-rack');
var pathutil = require('path');
var wrench = require('wrench');
var fs = require('fs');
var cleancss = require('clean-css');
var async = require('async');
var uglify = require('uglify-js');
var isProduction = sails.config.environment === 'production';

var JavascriptAsset = rack.Asset.extend({
	mimetype: 'text/javascript',
	create: function() {
		var self = this;
		self.paths = search(sails.config.assets.sequence, /(\.js|\.coffee|\.ts)$/);
		self.assets = [];
		async.forEachSeries(self.paths, function(path, next) {
			var ext = pathutil.extname(path);
			var extensionHandlers = [];

			var assetUrl = '/' + pathutil.relative(sails.config.appPath, path)
				.replace(ext, '.js')
				.replace(/\\/g, '/');

			if (path.indexOf('.ts') !== -1) {
				var tsc = require('node-typescript');
				extensionHandlers.push [{ ext: 'ts', handler: tsc.compile }]
			}

      var asset = new rack.SnocketsAsset({
        mimetype: 'text/javascript',
        filename: path,
        url: assetUrl,
        compress: false
      });

			asset.isDev = true;
			self.assets.push(asset);
			asset.on('complete', next);
			asset.on('error', function(e) {
				if(ext == ".coffee") {
					sails.log.error('CoffeeScript compilation failed:');
				}
				else if(ext == ".ts") {
					sails.log.error('TypeScript compilation failed:');
				}
				sails.log.error(e);
			});

		}, function(error) {
			if (error) self.emit('error', error);
			self.contents = '';
			if (isProduction) {
				_.each(self.assets, function(asset) {
					self.contents += asset.contents + '\n';
				});
				self.contents = uglify.minify(self.contents, {
					fromString: true
				}).code;
			}
			self.isDev = false;
			self.emit('created');
		});
	}
});

var CssAsset = rack.Asset.extend({
	create: function() {
		var self = this;
		self.assetTypes = {".less": "Less", ".styl": "Stylus"};
		self.regex = /(\.css|\.less|\.styl)$/;
		self.paths = search(sails.config.assets.sequence, self.regex);
		self.assets = [];

		// Build collection 
		async.forEachSeries(self.paths, function(path, next) {
			var asset,
			url = '/' + pathutil.relative(sails.config.appPath, path).replace(/\\/g, '/')
				.replace(self.regex, '.css');
			type = self.assetTypes[ pathutil.extname(path) ]
			if(type === undefined) asset = new rack.Asset({
				url: url,
				contents: fs.readFileSync(path, 'utf8')
			});
			else asset = new rack[type+"Asset"]({
				url: url,
				filename: path
			})
			asset.isDev = true;
			self.assets.push(asset);
			asset.on('complete', next);
			asset.on('error', function(e) {
				if (type !== undefined)
					sails.log.error(type+' compilation failed:');
				sails.log.error(e);
				next();
			});

		}, function(error) {
			if (error) self.emit('error', error);
			self.contents = '';
			if (isProduction) {
				_.each(self.assets, function(asset) {
					self.contents += asset.contents + '\n';
				});
				self.contents = cleancss.process(self.contents);
			}
			self.isDev = false;
			self.emit('created');
		});
	}
});

var TemplateAsset = rack.Asset.extend({
	create: function() {
		var self = this;
		self.regex = /\.ejs|\.html|\.tmpl$/;
		self.paths = search(sails.config.assets.sequence, self.regex);
		self.contents = '<div style="display:none;" id="rigging-template-library">\n';
		_.each(self.paths, function(path) {
			var fileContents = fs.readFileSync(path, 'utf8');
			self.contents += fileContents;
		});
		self.contents += '</div>';
		self.emit('created');
	}
});

var Rack = rack.Rack.extend({
	js: function(assetName) {
		return this.asset(assetName, {mimetype: 'text/javascript', dir: '/assets/js'});
	},
	css: function(assetName) {
		return this.asset(assetName, {mimetype: 'text/css', dir: '/assets/styles'});
	},
	templateLibrary: function() {
		var out = '';
		_.each(this.assets, function(asset) {
			if (asset.mimetype === 'text/html') {
				out += asset.contents;
			}
		});
		return out;
	},
	asset: function(assetName, opts) {
		var out = '';
		var isProduction = (sails.config.environment == 'production');

		_.each(this.assets, function(asset) {
			fileName = asset.url.substring(opts.dir.length)

			// If any of these conditions are met this is not 
			// the asset we are looking for.
			if (
				asset.isDev == isProduction ||													// correct env?
				asset.mimetype != opts.mimetype ||											// correct mimetype?
				asset.url.indexOf(opts.dir) != 0 ||											// correct directory?
				(fileName.indexOf(assetName) != 0 && assetName != null)	// correct file name?
			) return;

			out += asset.tag() + '\n';
		});
		return out;
	}
});

/**
 * given a list directories with relative paths to `sails.config.appPath`
 * and a regex, return all the files in the directories that match
 * the given regex
 */
var search = function(dirnames, regex) {
	var paths = [];
	_.each(dirnames, function(dirname) {
		var abspath = pathutil.join(sails.config.appPath, dirname);
		var filenames = wrench.readdirSyncRecursive(abspath);
		_.each(filenames, function(filename) {
			var filepath = pathutil.join(abspath, filename);
			if (!fs.statSync(filepath).isFile() || !regex.test(filepath)) return;
			paths.push(filepath);
		});
	});
	return paths;
};

exports.createAssets = function() {
	return new Rack([
	new JavascriptAsset({
		url: '/assets/js/'
	}), new CssAsset({
		url: '/assets/styles/'
	}), new TemplateAsset({
		url: '/assets/templates/'
	})]);
	return new Rack([]);
};
