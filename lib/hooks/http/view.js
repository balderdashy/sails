/**
 * Module dependencies
 */
var util = require('util'),
	path = require('path'),
	glob = require('glob'),
	ExpressView = require('express/lib/view'),
	utils = require('express/lib/utils');

var basename = path.basename,
	dirname = path.dirname,
	join = path.join,
	globPath = function(path) {
		// return glob.sync(path, {
		// 	nocase: true
		// });
		return glob.sync(basename(path), {
			cwd: dirname(path),
			nocase: true
		});
	},
	exists = function(path) {
		return globPath(path).length > 0;
	};


/**
 * Build SailsView
 */

var SailsView = function (name, options) {
		ExpressView.call(this, name, options);
	};
util.inherits(SailsView, ExpressView);
SailsView.prototype.lookup = function(path) {
	var ext = this.ext;

	// <path>.<engine>
	if (!utils.isAbsolute(path)) path = join(this.root, path);
	if (exists(path)) return path;//return globPath(path)[0];

	// <path>/index.<engine>
	path = join(dirname(path), basename(path, ext), 'index' + ext);
	if (exists(path)) return path;//return globPath(path)[0];
};


module.exports = SailsView;