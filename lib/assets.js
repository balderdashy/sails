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
var isProduction = sails.config.environment === 'production';

var JavascriptAsset = rack.Asset.extend({
    mimetype: 'text/javascript',
    create: function() {
        var self = this;
        self.paths = search(sails.config.assets.sequence, /(\.js|\.coffee|\.ts)$/);
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
            } else if (path.indexOf('.ts') != -1) {
                var tsc = require('node-typescript');
                var jscode = null;
                try {
                    jscode = tsc.compile(path, fs.readFileSync(path, 'utf8'));
                } catch (e) {
                    jscode = '';
                }
                asset = new rack.Asset({
                    mimetype: 'text/javascript',
                    url: '/' + pathutil.relative(sails.config.appPath, path).replace('.ts', '.js').replace(/\\/g, '/'),
                    contents: jscode
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
        self.regex = /(\.css|\.less)$/;
        self.paths = search(sails.config.assets.sequence, self.regex);
        self.assets = [];
        async.forEachSeries(self.paths, function(path, next) {
            var asset,
            url = '/' + pathutil.relative(sails.config.appPath, path).replace(/\\/g, '/')
                .replace('.less', '.css');
            if (pathutil.extname(path) === '.less') asset = new rack.LessAsset({
                url: url,
                filename: path
            })
            else asset = new rack.Asset({
                url: url,
                contents: fs.readFileSync(path, 'utf8')
            });
            asset.isDev = true;
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if (error) self.emit('error', error);
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
    js: function() {
        var out = '';
        _.each(this.assets, function(asset) {
            isJs = asset.mimetype == 'text/javascript';
            if (sails.config.environment == 'production') {
                if (isJs && !asset.isDev) out += asset.tag() + '\n';
            } else {
                if (isJs && asset.isDev) out += asset.tag() + '\n';
            }
        });
        return out;
    },
    css: function() {
        var out = '';
        _.each(this.assets, function(asset) {
            isCss = asset.mimetype == 'text/css';
            if (sails.config.environment == 'production') {
                if (isCss && !asset.isDev) out += asset.tag() + '\n';
            } else {
                if (isCss && asset.isDev) out += asset.tag() + '\n';
            }
        });
        return out;
    },
    templateLibrary: function() {
        var out = '';
        _.each(this.assets, function(asset) {
            if (asset.mimetype == 'text/html') {
                out += asset.contents;
            }
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
        url: '/app.js'
    }), new CssAsset({
        url: '/style.css'
    }), new TemplateAsset({
        url: '/templates.html'
    })]);
};