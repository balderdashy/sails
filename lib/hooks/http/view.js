/**
 * Module dependencies
 */

var util = require('util');
var path = require('path');
var glob = require('glob');
var ExpressView = require('@sailshq/express/lib/view');
var expressUtils = require('@sailshq/express/lib/utils');



var globPath = function(viewPath) {
  // return glob.sync(path, {
  //  nocase: true
  // });
  return glob.sync(path.basename(viewPath), {
    cwd: path.dirname(viewPath),
    nocase: true
  });
};

/**
 * `exists()`
 *
 * Helper function to check existence of the specified path amongst the app's views.
 * @param  {String} viewPath
 * @return {Boolean}
 */
var exists = function(viewPath) {
  return globPath(viewPath).length > 0;
};


/**
 * @constructs {SailsView}
 */
function SailsView (name, options) {
  ExpressView.call(this, name, options);
}
util.inherits(SailsView, ExpressView);

SailsView.prototype.lookup = function(viewPath) {
  var viewExt = this.ext;
  var rootPath = this.root;

  // <path>.<engine>
  if (!expressUtils.isAbsolute(viewPath)) {
    viewPath = path.join(rootPath, viewPath);
  }
  if (exists(viewPath)) {
    return viewPath; //return globPath(viewPath)[0];
  }

  // <path>/index.<engine>
  viewPath = path.join(path.dirname(viewPath), path.basename(viewPath, viewExt), 'index' + viewExt);
  if (exists(viewPath)) {
    return viewPath; //return globPath(path)[0];
  }
};


module.exports = SailsView;

