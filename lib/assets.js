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