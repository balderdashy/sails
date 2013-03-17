// assets.js
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
var less = require('less');
var isProduction = sails.config.environment === 'production';

var JavascriptAsset = rack.Asset.extend({
    mimetype: 'text/javascript',
    create: function() {
        var self = this;
        self.paths = search(sails.config.assets.sequence, /(\.js|\.coffee)$/);
        self.assets = [];
        async.forEachSeries(self.paths, function(path, next) {
            var asset;
            if (path.indexOf('.coffee') != -1) {
                var coffee = require('coffee-script');
                asset = new rack.Asset({
                    mimetype: 'text/javascript',
                    url: '/' + pathutil.relative(sails.config.appPath, path).replace('.coffee', '.js').replace(/\\/g, '/'),
                    contents: coffee.compile(fs.readFileSync(path, 'utf8'))
                });
            } else {
                asset = new rack.Asset({
                    mimetype: 'text/javascript',
                    url: '/' + pathutil.relative(sails.config.appPath, path).replace(/\\/g, '/'),
                    contents: fs.readFileSync(path, 'utf8')
                });
            }
            asset.isDev = true;
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if(error) self.emit('error', error);
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
        self.regex = /(\.css|\.less)$/;
        self.paths = search(sails.config.assets.sequence, self.regex);
        self.assets = [];
        self.lessContents = '';
        async.forEachSeries(self.paths, function(path, next) {
            var asset;
            if(pathutil.extname(path) == '.less') {
                self.lessContents += fs.readFileSync(path);
                return next();
            } else {
                asset = new rack.Asset({
                    url: '/' + pathutil.relative(sails.config.appPath, path).replace(/\\/g, '/'),
                    contents: fs.readFileSync(path, 'utf8')
                });
            }
            asset.isDev = true;
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if(error) self.emit('error', error);
            var parser = new less.Parser();
            parser.parse(self.lessContents, function(error, tree) {
                if (error) return self.emit('error');
                var lessAsset = new rack.Asset({
                    url: '/assets/styles/style.less.css',
                    mimetype: 'text/css',
                    contents: tree.toCSS()
                });
                lessAsset.isDev = true;
                self.assets.push(lessAsset);
                lessAsset.on('complete', function() { 
                    self.contents = '';
                    if (isProduction) {
                        _.each(self.assets, function(asset) {
                            self.contents += asset.contents += '\n';
                        });
                        self.contents = cleancss.process(self.contents);
                    }
                    self.isDev = false;
                    self.emit('created');
                });
            });
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
        filenames = wrench.readdirSyncRecursive(abspath);
        _.each(filenames, function(filename) {
            path = pathutil.join(abspath, filename);
            if(!fs.statSync(path).isFile() || !regex.test(path)) return;
            paths.push(path);
        });
    });
    return paths;
};

exports.createAssets = function() {
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

