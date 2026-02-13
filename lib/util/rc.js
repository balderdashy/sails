// Note: This is an inlined version of the rc npm package.
/*!
 *
 * @description Recursive object extending
 * @author Viacheslav Lotsmanov <lotsmanov89@gmail.com>
 * @license MIT
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2018 Viacheslav Lotsmanov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Module dependencies
 */


'use strict';
var fs   = require('fs');
var ini  = require('ini');
var path = require('path');
var etc = '/etc';
var win = process.platform === 'win32';
var home = win ? process.env.USERPROFILE : process.env.HOME;
var deepExtend = require('./deep-extend.js');

module.exports = function rc(name, defaults, argv, parse) {


  var parseFn = function (content) {
    //if it ends in .json or starts with { then it must be json.
    //must be done this way, because ini accepts everything.
    //can't just try and parse it and let it throw if it's not ini.
    //everything is ini. even json with a syntax error.

    if(/^\s*{/.test(content)) {
      return JSON.parse(content);
    }
    return ini.parse(content);

  };

  var fileFn = function () {
    var args = [].slice.call(arguments).filter(function (arg) { return arg !== null;});

    //path.join breaks if it's a not a string, so just skip this.
    for(var i in args) {
      if('string' !== typeof args[i]) {
        return;
      }
    }

    var file = path.join.apply(null, args);
    try {
      return fs.readFileSync(file,'utf-8');
    } catch (unusedErr) {
      return;
    }
  };

  var jsonFn = function () {
    var content = fileFn.apply(null, arguments);
    return content ? parseFn(content) : null;
  };

  var envFn = function (prefix, env) {
    env = env || process.env;
    var obj = {};
    var l = prefix.length;
    for(var k in env) {
      if(k.toLowerCase().indexOf(prefix.toLowerCase()) === 0) {

        var keypath = k.substring(l).split('__');

        // Trim empty strings from keypath array
        var _emptyStringIndex;
        while ((_emptyStringIndex=keypath.indexOf('')) > -1) {
          keypath.splice(_emptyStringIndex, 1);
        }

        var cursor = obj;
        keypath.forEach(function _buildSubObj(_subkey,i){

          // (check for _subkey first so we ignore empty strings)
          // (check for cursor to avoid assignment to primitive objects)
          if (!_subkey || typeof cursor !== 'object') {
            return;
          }

          // If this is the last key, just stuff the value in there
          // Assigns actual value from env variable to final key
          // (unless it's just an empty string- in that case use the last valid key)
          if (i === keypath.length-1) {
            cursor[_subkey] = env[k];
          }


          // Build sub-object if nothing already exists at the keypath
          if (cursor[_subkey] === undefined) {
            cursor[_subkey] = {};
          }

          // Increment cursor used to track the object at the current depth
          cursor = cursor[_subkey];

        });

      }

    }

    return obj;
  };

  var findFn = function () {
    var rel = path.join.apply(null, [].slice.call(arguments));

    function find(start, rel) {
      var file = path.join(start, rel);
      try {
        fs.statSync(file);
        return file;
      } catch (unusedErr) {
        if(path.dirname(start) !== start) {// root
          return find(path.dirname(start), rel);
        }
      }
    }
    return find(process.cwd(), rel);
  };



  if('string' !== typeof name) {
    throw new Error('rc(name): name *must* be string');
  }
  if(!argv) {
    argv = require('minimist')(process.argv.slice(2));
  }
  defaults = (
      'string' === typeof defaults
    ? jsonFn(defaults) : defaults
  ) || {};

  parse = parse || parseFn;

  var env = envFn(name + '_');

  var configs = [defaults];
  var configFiles = [];
  function addConfigFile (file) {
    if (configFiles.indexOf(file) >= 0) {return;}
    var fileConfig = fileFn(file);
    if (fileConfig) {
      configs.push(parse(fileConfig));
      configFiles.push(file);
    }
  }

  // which files do we look at?
  if (!win) {
    [path.join(etc, name, 'config'), path.join(etc, name + 'rc')].forEach(addConfigFile);
  }
  if (home) {
    [
      path.join(home, '.config', name, 'config'),
      path.join(home, '.config', name),
      path.join(home, '.' + name, 'config'),
      path.join(home, '.' + name + 'rc')
    ].forEach(addConfigFile);
    addConfigFile(findFn('.'+name+'rc'));
  }
  if (env.config) {
    addConfigFile(env.config);
  }
  if (argv.config) {
    addConfigFile(argv.config);
  }

  return deepExtend.apply(null, configs.concat([
    env,
    argv,
    configFiles.length ? {configs: configFiles, config: configFiles[configFiles.length - 1]} : undefined,
  ]));
};
