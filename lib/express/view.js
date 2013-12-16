var util = require('util'),
  path = require('path'),
  glob = require('glob'),
  ExpressView = require('express/lib/view'),
  utils = require('express/lib/utils'),
  basename = path.basename,
  dirname = path.dirname,
  join = path.join,
  globPath = function (path) {
    return glob.sync(basename(path), {cwd: dirname(path), nocase: true});
  },
  exists = function (path) {
    return globPath(path).length > 0;
  };

function SailsView(name, options) {
  ExpressView.call(this, name, options);
}

util.inherits(SailsView, ExpressView);

SailsView.prototype.lookup = function(path) {
  var ext = this.ext;

  // <path>.<engine>
  if (!utils.isAbsolute(path)) path = join(this.root, path);
  if (exists(path)) return path;

  // <path>/index.<engine>
  path = join(dirname(path), basename(path, ext), 'index' + ext);
  if (exists(path)) return path;
};

module.exports = SailsView;