var rack = require('../../../../techpines/asset-rack');
var pathutil = require('path');
var wrench = require('wrench');
var fs = require('fs');
var async = require('async');
var uglify = require('uglify-js');
var _ = require('underscore');
var isProduction = sails.config.environment === 'production';

exports.RiggingJS = rack.Asset.extend({
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
                url: '/' + pathutil.basename(path),
                contents: fs.readFileSync(path, 'utf8'),
            });
            self.assets.push(asset);
            asset.on('complete', next);
        }, function(error) {
            if (error) self.emit('error', error);
            self.emit('created');
        });
    }
});

exports.RiggingCSS = rack.Asset.extend({
    create: function() {
        if (isProdution) {
            createProduction()
        } else {
            createDev()
        }   
    }
});

exports.Rack = rack.Rack.extend({
    js: function() {
        out = ''
        _.each(this.assets, function(asset) {
            isJs = asset.mimetype == 'text/javascript';
            if (isJS) out += asset.tag() + '\n';
        }); 
        return out
    },
    css: function() {
        out = '';
        _.each(this.assets, function(asset) {
            isCss = asset.mimetype == 'text/css';
            if (isCss) out += asset.tag() + '\n';
        }); 
        return out
    }
})

var search = function(dirnames, regex) {
    paths = [];
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
