
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
        if (isProduction) {
            this.createProduction()
        } else {
            this.createDev()
        }
    },

    createProduction: function() {
        this.paths = search(sails.config.rigging.sequence, /\.js$/);
        this.url = '/rigging_production/rigging.min.js';
        this.contents = '';
        
        _.each(this.paths, function(path) {
            this.contents += fs.readFileSync(path, 'utf8');
        })        
        this.contents = uglify.minfiy(this.contents, {fromString: true});
        this.emit('created');
    },

    createDev: function() {
        var self = this;
        this.paths = search(sails.config.rigging.sequence, /\.js$/);
        this.assets = []
        async.forEachSeries(this.paths, function(path, next) {
            asset = new rack.Asset({
                mimetype: 'text/javascript',
                url: '/' + pathutil.relative(sails.config.appPath, path),
                contents: fs.readFileSync(path, 'utf8')
            });
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if (error) self.emit('error', error);
            self.emit('created');
        });
    }
});

var CssAsset = rack.Asset.extend({
    create: function() {
        this.regex = /(\.css|\.less)/
        if (isProduction) {
            this.createProduction()
        } else {
            this.createDev()
        }   
    },
    createDev: function() {
        var self = this;
        this.paths = search(sails.config.rigging.sequence, this.regex);
        this.assets = []
        async.forEachSeries(this.paths, function(path, next) {
            var asset;
            if (pathutil.extname(path) == '.less') {
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
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if (error) self.emit('error', error);
            self.emit('created');
        });
    }
});

var TemplateAsset = rack.Asset.extend({
    create: function() {
        var self = this;
        self.regex = /\.ejs/;
        self.paths = search(sails.config.rigging.sequence, self.regex);
        self.contents = '<div style="display:none;" id="rigging-template-library">\n';
        _.each(self.paths, function(path) {
            var fileContents = fs.readFileSync(path, 'utf8');
            self.contents += fileContents;
        })
        self.contents += '</div>';
        this.emit('created');
    }
});

var Rack = rack.Rack.extend({
    js: function() {
        var out = ''
        _.each(this.assets, function(asset) {
            isJs = asset.mimetype == 'text/javascript';
            if (isJs) out += asset.tag() + '\n';
        }); 
        return out;
    },
    css: function() {
        var out = '';
        _.each(this.assets, function(asset) {
            isCss = asset.mimetype == 'text/css';
            if (isCss) out += asset.tag() + '\n';
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
})

var search = function(dirnames, regex) {
    paths = [];
    console.log(dirnames);
    _.each(dirnames, function(dirname) {
        abspath = pathutil.join(sails.config.appPath, dirname);
        filenames = wrench.readdirSyncRecursive(abspath);        
        _.each(filenames, function(filename) {
            path = pathutil.join(abspath, filename);
            if (!fs.statSync(path).isFile() || !regex.test(path)) return;
            paths.push(path);
        });
    });
    return paths
}

module.exports = new Rack([
    new JavascriptAsset({
        urlPrefix: '/assets'
    }),
    new CssAsset({
        urlPrefix: '/assets',
    }),
    new TemplateAsset({url: '/templates.html'})
]);



