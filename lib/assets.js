var async = require('async');
var fs = require('fs-extra');
var _ = require('underscore');
_.str = require('underscore.string');
var path = require('path');


// module.exports = {

// 	// Prepare assets in dev env
// 	development: function (req,res,next){
// 		rigging.compile(sails.config.assets.sequence, {
// 			outputPath: './.tmp',
// 			environment: sails.config.environment
// 		}, function (err, stuff) {
// 			console.log(err,stuff, Injector);
// 			res.locals({
// 				assets: Injector
// 			});
// 			next();
// 		});
// 	}
// };

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// Original injection code
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
var Injector = {
	/**
	* Recompile all LESS and SASS assets, then generate link tags for CSS files
	* Either one minified file (in production), or a link to each individual file (in development)
	*/
	css: function() {
		var html = '';

		if(sails.config.environment === 'production') {
			// In production mode, use minified version built ahead of time
			html+='<link rel="stylesheet" type="text/css" media="all" href="/rigging_production/rigging.min.css"/>';
		}
		else {
			// In development mode, lookup css files on the rigging path on the fly
			var apath = _.clone(sails.config.assets.sequence);
			var cssFiles = rigging.ls(apath,/\.css$/,true);

			// Add LESS and SASS files (these were compiled in res.view)
			cssFiles.push("rigging.less.css");
			cssFiles.push("rigging.sass.css");

			_.each(cssFiles,function(path) {
				html+='<link rel="stylesheet" type="text/css" media="all" href="/rigging_static/'+path+'"/>';
			});
		}

		return html;
	},

	/**
	* Recompile all coffeescript assets, then generate script tags for js files
	* Either one minified file (in production), or a link to each individual file (in development)
	*/
	js: function() {
		var html = '';

		if(sails.config.environment === 'production') {
			// In production mode, use minified version built ahead of time
			html += '<script type="text/javascript" src="/rigging_production/rigging.min.js"></script>';
		}
		else {
			// In development mode, lookup js files in the rigging dir(s) on the fly
			var apath = _.clone(sails.config.assets.sequence);
			var jsFiles = rigging.ls(apath,/\.js$/,true);

			// Add CoffeeScript file (this was compiled in res.view)
			jsFiles.push("rigging.coffee.js");

			_.each(jsFiles,function(path) {
				html+='<script type="text/javascript" src="/rigging_static/'+path+'"></script>';
			});
		}
		return html;
	},


	/**
	* Write templates to the template library div.
		* TODO: In lieu of a true cache, store the compiled templates in memory in production mode.
		* (Because templates are dumped directly into the layout, we cannot use standard HTTP or file 
		* caching methods.)
	*/
	templateLibrary: function() {
		var html = '<div style="display:none;" id="rigging-template-library">\n';

		// Get all template files in rigging sequence
		var apath = _.clone(sails.config.assets.sequence);
		var templateFiles = rigging.ls(apath, new RegExp('\\.'+sails.config.viewEngine));
		_.each(templateFiles,function(filepath) {
			html += require('fs').readFileSync(filepath,'utf8') + "\n";
		});

		html+="</div>";
		return html;
	}
};



////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// New injection code
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// module.exports = {

// 	// Prepare assets in dev env
// 	development: function (req,res,next){
// 		rigging.compile(sails.config.assets.sequence, {
// 			outputPath: './.tmp'
// 		}, function (err, stuff) {
// 			console.log(err,stuff);
// 			res.locals({
// 				assets: Injector
// 			});
// 			next();
// 		});
// 	},

// 	// TODO: fix this
// 	_developmentNew: function(req, res, next) {

// 		var assets = {
// 			css: [],
// 			js: [],
// 			templates: []
// 		};

// 		// Resolve each asset in sequence to its full canonical path
// 		var srcFiles = _.map(sails.config.assets.sequence, path.resolve);
		
// 		// Keep track of file contents loaded in
// 		var assetCache = {};

// 		// Keep track of all asset paths
// 		var assetSet = [];

// 		async.series([

// 		// Read files from disk
// 		function readFiles(cb) {
// 			async.forEach(srcFiles, function (path, cb) {
// 				discoverFiles(path, function (err, results) {
// 					if (err) return cb(err);
// 					assetSet.concat(results);
// 					// assetCache[path] = results;
// 					cb();
// 				});
// 			}, cb);
// 		},

// 		// Precompile as necessary
// 		function precompile(cb) {
// 			// console.log(assetSet);
// 			cb();
// 		},

// 		// Pass down compiled values to layout

// 		function passDownToLayout(cb) {
// 			res.locals({
// 				assets: {
// 					css: function() {
// 						return "CSS";
// 					},
// 					js: function() {
// 						return "JS";
// 					},
// 					templateLibrary: function() {
// 						return "T";
// 					}
// 				}
// 			});
// 			cb();
// 		}

// 		], next);
// 	}
// };


// Recursively load files from a dir and subdirs
function loadFiles(topLevelPath, cb) {
	var results = {};
	return recurse(topLevelPath, results, 'read', function (err) {
		return cb(err,results);
	});
}

// Recursively discover the paths to files
function discoverFiles(topLevelPath, cb) {
	var results = {};
	return recurse(topLevelPath, results, 'discover', function (err) {

		// Flatten
		console.log(flatten(results));
		return cb(err,flatten(results));
		
		function flatten(obj) {
			var sublist = [];
			_.each(obj, function (val, key){
				if (_.isObject(val)) sublist.concat(flatten(val));
				else sublist.push(key);
			});
			return sublist;
		}
	});
}

// Rescursive closure (build outputObject)
function recurse(thisPath, outputObject, action, cb) {
	fs.stat(thisPath, function(err, stat) {
		if (err) return cb(err);

		// No file exists
		else if (!stat) return cb();

		// File detected, capture and read it
		else if(stat.isFile()) {
			if (action === 'read') {
				fs.readFile(thisPath, 'utf8', function (err, contents) {
					if (err) return cb(err);

					// Then pass it back up
					outputObject[thisPath] = contents;
					return cb();
				});
			}
			else if (action === 'discover') {
				outputObject[thisPath] = true;
				return cb();
			}
		}

		// Directory detected, recursively descend
		else if(stat.isDirectory()) {

			// Build and write to new subdir object
			outputObject[thisPath] = {};

			// Get contents of directory
			fs.readdir(thisPath, function (err,subpaths) {

				// If empty, go ahead and get out
				if (!subpaths || !subpaths.length) return cb();

				// Recursively descend into each sub file/dir
				async.forEach(subpaths, function (subpath, cb) {

					// Expand to full canonical path
					subpath = path.resolve(thisPath + '/' + subpath);
					recurse(subpath, outputObject[thisPath], action, cb);
				}, cb);
			});
		} 

		// Unknown file-like object detected
		else return cb(err);
	});
}



////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// Asset Rack integration
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
/*
var rack = require('asset-rack');
var pathutil = require('path');
var wrench = require('wrench');
var fs = require('fs');
var async = require('async');
var uglify = require('uglify-js');
var _ = require('underscore');
var isProduction = sails.config.environment === 'production';

var JavascriptAsset = rack.Asset.extend({
    mimetype: 'text/javascript',
    create: function() {
        var self = this;
        self.paths = search(sails.config.assets.sequence, /\.js$/);
        self.assets = [];
        async.forEachSeries(self.paths, function(path, next) {
            var asset = new rack.Asset({
                mimetype: 'text/javascript',
                url: '/' + pathutil.relative(sails.config.appPath, path),
                contents: fs.readFileSync(path, 'utf8')
            });
            asset.isDev = true;
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if(error) self.emit('error', error);
            self.contents = '';
            _.each(self.assets, function(asset) {
                self.contents += asset.contents + '\n';
            });
            self.contents = uglify.minify(self.contents, {
                fromString: true
            }).code;
            self.isDev = false;
            self.emit('created');
        });
    }
});

var CssAsset = rack.Asset.extend({
    create: function() {
        var self = this;
        self.regex = /(\.css|\.less)$/;
        self.paths = search(sails.config.assets.sequence, self.regex);
        self.assets = [];
        async.forEachSeries(self.paths, function(path, next) {
            var asset;
            if(pathutil.extname(path) == '.less') {
                asset = new rack.LessAsset({
                    url: '/' + pathutil.relative(sails.config.appPath, path).replace(/\.less/, '.css'),
                    filename: path
                });
            } else {
                asset = new rack.Asset({
                    url: '/' + pathutil.relative(sails.config.appPath, path),
                    contents: fs.readFileSync(path, 'utf8')
                });
            }
            asset.isDev = true;
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if(error) self.emit('error', error);
            self.contents = '';
            _.each(self.assets, function(asset) {
                self.contents += asset.contents += '\n';
            });
            self.isDev = false;
            self.emit('created');
        });
    }
});

var TemplateAsset = rack.Asset.extend({
    create: function() {
        var self = this;
        self.regex = /\.ejs$/;
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
    js: function() {
        var out = '';
        _.each(this.assets, function(asset) {
            isJs = asset.mimetype == 'text/javascript';
            if(sails.config.environment == 'production') {
                if(isJs && !asset.isDev) out += asset.tag() + '\n';
            } else {
                if(isJs && asset.isDev) out += asset.tag() + '\n';
            }
        });
        return out;
    },
    css: function() {
        var out = '';
        _.each(this.assets, function(asset) {
            isCss = asset.mimetype == 'text/css';
            if(sails.config.environment == 'production') {
                if(isCss && !asset.isDev) out += asset.tag() + '\n';
            } else {
                if(isCss && asset.isDev) out += asset.tag() + '\n';
            }
        });
        return out;
    },
    templateLibrary: function() {
        var out = '';
        _.each(this.assets, function(asset) {
            if(asset.mimetype == 'text/html') {
                out += asset.contents;
            }
        });
        return out;
    }
});

var search = function(dirnames, regex) {
    paths = [];
    _.each(dirnames, function(dirname) {
        abspath = pathutil.join(sails.config.appPath, dirname);
        console.log("dirname",dirname);
        console.log("appPath",sails.config.appPath);
        console.log("absPath",abspath);
        filenames = wrench.readdirSyncRecursive(abspath);
        _.each(filenames, function(filename) {
            path = pathutil.join(abspath, filename);
            if(!fs.statSync(path).isFile() || !regex.test(path)) return;
            paths.push(path);
        });
    });
    return paths;
};

module.exports = function() {
    return new Rack([
        new JavascriptAsset({
            url: '/app.js'
        }), new CssAsset({
            url: '/style.css'
        }), new TemplateAsset({
            url: '/templates.html'
        })
    ]);
};
*/