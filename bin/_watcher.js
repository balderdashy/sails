/**
 * Module dependencies
 */

var _ = require('lodash');
var watch = require('glob-watcher');
var fork  = require('child_process').fork;

/**
 * _watcher.js
 *
 * Restarting server if server files are changed.
 */

module.exports = function() {

  if (!process.connected) {

    var child = fork(process.argv[1], process.argv.slice(2, process.argv.length));

    watch(["api/**/*.js", "config/**/*.js", "tasks/**/*.js"], _.debounce(function() {
      child.kill('SIGINT');
      child = fork(process.argv[1], process.argv.slice(2, process.argv.length));
    }), 200);

    return true;
  }

  return false;
};