/**
 * Use `packpath` (https://github.com/jprichardson/node-packpath)
 * to generate a more convenient require method.
 *
 * Not efficient (uses fs.*Sync() methods), but great for tests!
 * 
 * @type {[type]}
 */
module.exports = function (moduleRelativePath) {
	require('path').join(require('packpath').self(),moduleRelativePath);
};
