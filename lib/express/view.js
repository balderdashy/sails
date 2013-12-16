var util = require('util'),
  path = require('path'),
  glob = require('glob'),
  ExpressView = require('express/lib/view'),
  utils = require('express/lib/utils'),
  basename = path.basename,
  dirname = path.dirname,
  join = path.join,
  globPath = function (path) {
    return glob.sync(path, {nocase: process.platform !== 'win32'});
  },
  exists = function (path) {
    return globPath(path).length > 0;
  };

function SailsView(name, options) {
  ExpressView.call(this, name, options);
}

util.inherits(SailsView, ExpressView);

SailsView.prototype.lookup = function(path) {
  var ext = this.ext
    , bkpPath = path;

  // <path>.<engine>
  if (!utils.isAbsolute(path)) path = join(this.root, path);

  if (exists (path)) {
    return globPath(path)[0];
  } else {
    if(sails.config.modules) {
      var fragments = bkpPath.split('/');
      if(_.indexOf(sails.config.modules.register, fragments[0]) !== -1) {
        var fragment = fragments.shift();
        var modulePath = join(sails.config.modules.path, fragment, 'views', fragments.join('/'));
        if(fragments.length > 1 && exists(modulePath)) {
          return globPath(modulePath)[0];
        }
        else if(fragments.length > 0) {
          modulePath = join(dirname(modulePath), basename(modulePath, ext), 'index' + ext);
          if(exists(modulePath)) return globPath(modulePath)[0];
        }
      }
    }
  }

  // <path>/index.<engine>
  path = join(dirname(path), basename(path, ext), 'index' + ext);
  if (exists(path)) return globPath(path)[0];
};

module.exports = SailsView;