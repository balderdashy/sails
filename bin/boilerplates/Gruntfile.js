/**
 * Gruntfile
 *
 * If you created your Sails app with `sails new foo --linker`,
 * the following files will be automatically injected (in order)
 * into the EJS and HTML files in your `views` and `assets` folders.
 *
 * At the top part of this file, you'll find a few of the most commonly
 * configured options, but Sails' integration with Grunt is also fully
 * customizable.  If you'd like to work with your assets differently
 * you can change this file to do anything you like!
 *
 * More information on using Grunt to work with static assets:
 * http://gruntjs.com/configuring-tasks
 */

/*
* This allows you to do require('path/to/relative.file') relative to the project
* root directory
* */
process.env.NODE_PATH = __dirname;
require('module')._initPaths();

/*
 * Loads grunt configuration from ./lib/options folder
 * by convention the directory structure define the final structure of the
 * config.
 * So that if you have the following directory structure:
 * ./lib/tasks/options
 *   -> clean.js
 *   other-folder
 *     -> otherFile.js
 *
 * this will result in the following config:
 * {
 *   clean: //content of clean.js//
 *   other-folder: {
 *     otherFile: //content of otherFile.js//
 *   }
 * }
 * */
function loadConfig(grunt, basePath) {
  var path = require('path');
  var object = {},
    tempObject = {};
  var key, file;

  grunt.file.expand([path.join(basePath, "/**/*.coffee") , path.join(basePath, "/**/*.js")]).forEach(function (option) {
    key = path.relative(basePath, option).split(path.sep);
    //getting the filename without the extension
    file = path.basename(key.pop(), path.extname(option));

    tempObject = object;

    // looping through the directory structure to define the namespace
    key.forEach(function (key) {
      tempObject[key] = tempObject[key] || {};
      tempObject = tempObject[key];
    });

    tempObject[file] = require(option);
  });

  return object;
}


/*
 * Simply goes through the ./lib/tasks folder recursively, requiring all files
 * ending with .task.js/.task.coffee.
 * */
function loadTasks(grunt, path) {
  grunt.file.expand([path + "/**/*.task.js", path + "/**/*.task.coffee"]).forEach(function (task) {
    console.log(task);
    require(task)(grunt);
  });
}

module.exports = function (grunt) {
  var config = {
    pkg: grunt.file.exists('package.json') ? grunt.file.readJSON('package.json') : {},
    env: require('./config/local.js').environment
  };
  grunt.util._.extend(config, loadConfig(grunt, './lib/tasks/options/'));
  // Project configuration.
  grunt.initConfig(config);
  loadTasks(grunt, './lib/tasks');
};
