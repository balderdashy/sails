/**
 * Module dependencies
 */

var path = require('path');
var includeAll = require('include-all');



/**
 * require('sails/accessible/load-grunt-tasks')
 *
 * Load Grunt tasks from the conventional paths using the given
 * `grunt` instance.
 *
 * > This should not be modified.
 * > It's job is to eliminate the need for an extra `include-all` dep.
 * > in userland just to load Grunt tasks.  (The default Gruntfile.js
 * > calls this function directly-- this is partially to make it easy
 * > to do any major customizations directly in that file.  But more
 * > importantly, it's because Grunt doesn't work without it.)
 *
 * @param {String} appPath
 * @param {Ref} grunt
 */
module.exports = function loadGruntTasks (appPath, grunt){

  // Load JavaScript files from `tasks/config/**/*` and `tasks/register/**/*`
  // ========================================================
  // Load Grunt configuration modules from the specified
  // relative path. These modules should export a function
  // that, when run, should either load/configure or register
  // a Grunt task.
  //
  // This uses the include-all library in order to require all of
  // the app's grunt configurations and task registrations dynamically.
  var helperTasks = includeAll({
    dirname: path.resolve(appPath, './tasks/config'),
    filter: /(.+)\.js$/,
    excludeDirs: /^\.(git|svn)$/
  }) || {};
  // Same thing for our main tasklists.
  var mainTasks = includeAll({
    dirname: path.resolve(appPath, './tasks/register'),
    filter: /(.+)\.js$/,
    excludeDirs: /^\.(git|svn)$/
  }) || {};


  // Ensure that a default task exists.
  // ========================================================
  if (!mainTasks.default) {
    mainTasks.default = function(grunt) {
      grunt.registerTask('default', []);
    };
  }


  // Run task functions to configure Grunt.
  // ========================================================
  // Invoke the function from each Grunt configuration module
  // with a single argument - the `grunt` object.
  Object.keys(helperTasks).forEach(function (taskName){
    helperTasks[taskName](grunt);
  });
  // Same thing for our main tasklists.
  Object.keys(mainTasks).forEach(function (taskName){
    mainTasks[taskName](grunt);
  });

};
