#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('lodash');
var sailsgen = require('sails-generate');
var package = require('../package.json');
var rconf = require('../lib/app/configuration/rc');



/**
 * `sails new`
 *
 * Generate a new Sails app.
 *
 * ```
 * # In the current directory:
 * sails new
 * ```
 *
 * ```
 * # As a new directory or within an existing directory:
 * sails new foo
 * ```
 *
 * @stability 3
 * @see http://sailsjs.org/documentation/reference/command-line-interface/sails-new
 * ------------------------------------------------------------------------
 * This command builds `scope` for the generator by scooping up any available
 * configuration using `rc` (merging config from env vars, CLI opts, and
 * relevant `.sailsrc` files).  Then it runs the `sails-generate-new`
 * generator (https://github.com/balderdashy/sails-generate-new).
 */

module.exports = function () {

  // Build initial scope
  var scope = {
    rootPath: process.cwd(),
    modules: {},
    sailsRoot: nodepath.resolve(__dirname, '..'),
    sailsPackageJSON: package,
    viewEngine: rconf.viewEngine
  };

  // Support --template option for backwards-compat.
  if (!scope.viewEngine && rconf.template) {
    scope.viewEngine = rconf.template;
  }

  // Mix-in rconf
  _.merge(scope, rconf.generators);

  // TODO: just do a top-level merge and reference
  // `scope.generators.modules` as needed (simpler)
  _.merge(scope, rconf);


  // Pass the original CLI arguments down to the generator
  // (but first, remove commander's extra argument)
  var cliArguments = Array.prototype.slice.call(arguments);
  cliArguments.pop();
  scope.args = cliArguments;

  scope.generatorType = 'new';

  return sailsgen(scope, {
    success: function() {}
  });
};
