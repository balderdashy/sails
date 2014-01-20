/**
 * Our copy of Consolidate
 * https://github.com/visionmedia/consolidate.js/
 *
 * (wrapped up in a function so that the `appPath` can be passed down into it)
 *
 * This is necessary to allow other view engines to be specified by just the extension (e.g. `dust`)
 * instead of doing `{ ext: 'dust', fn: require('consolidate').dust }`
 */

module.exports = function(sailsAppPath) {

  /*!
   * consolidate
   * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
   * MIT Licensed
   *
   * Engines which do not support caching of their file contents
   * should use the `read()` function defined in consolidate.js
   * On top of this, when an engine compiles to a `Function`,
   * these functions should either be cached within consolidate.js
   * or the engine itself via `options.cache`. This will allow
   * users and frameworks to pass `options.cache = true` for
   * `NODE_ENV=production`, however edit the file(s) without
   * re-loading the application in development.
   */

  /**
   * Module dependencies.
   */

  var fs = require('fs')
    , path = require('path')
    , join = path.join
    , extname = path.extname
    , dirname = path.dirname;

  var readCache = {};

  /**
   * Require cache.
   */

  var cacheStore = {};

  /**
   * Require cache.
   */

  var requires = {};

  var fns = {};

  /**
   * Clear the cache.
   *
   * @api public
   */

  fns.clearCache = function(){
    cacheStore = {};
  };

  /**
   * Conditionally cache `compiled` template based
   * on the `options` filename and `.cache` boolean.
   *
   * @param {Object} options
   * @param {Function} compiled
   * @return {Function}
   * @api private
   */

  function cache(options, compiled) {
    // cachable
    if (compiled && options.filename && options.cache) {
      delete readCache[options.filename];
      cacheStore[options.filename] = compiled;
      return compiled;
    }

    // check cache
    if (options.filename && options.cache) {
      return cacheStore[options.filename];
    }

    return compiled;
  }

  /**
   * Read `path` with `options` with
   * callback `(err, str)`. When `options.cache`
   * is true the template string will be cached.
   *
   * @param {String} options
   * @param {Function} fn
   * @api private
   */

  function read(path, options, fn) {
    var str = readCache[path];
    var cached = options.cache && str && 'string' == typeof str;

    // cached (only if cached is a string and not a compiled template function)
    if (cached) return fn(null, str);

    // read
    fs.readFile(path, 'utf8', function(err, str){
      if (err) return fn(err);
      // remove extraneous utf8 BOM marker
      str = str.replace(/^\uFEFF/, '');
      if (options.cache) readCache[path] = str;
      fn(null, str);
    });
  }

  /**
   * Read `path` with `options` with
   * callback `(err, str)`. When `options.cache`
   * is true the partial string will be cached.
   *
   * @param {String} options
   * @param {Function} fn
   * @api private
   */

  function readPartials(path, options, fn) {
    if (!options.partials) return fn();
    var partials = options.partials;
    var keys = Object.keys(partials);

    function next(index) {
      if (index == keys.length) return fn(null);
      var key = keys[index];
      var file = join(dirname(path), partials[key] + extname(path));
      read(file, options, function(err, str){
        if (err) return fn(err);
        options.partials[key] = str;
        next(++index);
      });
    }

    next(0);
  }

  /**
   * fromStringRenderer
   */

  function fromStringRenderer(name) {
    return function(path, options, fn){
      options.filename = path;
      readPartials(path, options, function (err) {
        if (err) return fn(err);
        if (cache(options)) {
          fns[name].render('', options, fn);
        } else {
          read(path, options, function(err, str){
            if (err) return fn(err);
            fns[name].render(str, options, fn);
          });
        }
      });
    };
  }

  /**
   * Jade support.
   */

  fns.jade = function(path, options, fn){
    var engine = requires.jade;
    if (!engine) {
      try {
        engine = requires.jade = require(sailsAppPath + '/jade');
      } catch (err) {
        engine = requires.jade = require(sailsAppPath + '/then-jade');
      }
    }
    engine.renderFile(path, options, fn);
  };

  /**
   * Jade string support.
   */

  fns.jade.render = function(str, options, fn){
    var engine = requires.jade;
    if (!engine) {
      try {
        engine = requires.jade = require(sailsAppPath + '/jade');
      } catch (err) {
        engine = requires.jade = require(sailsAppPath + '/then-jade');
      }
    }
    engine.render(str, options, fn);
  };

  /**
   * Dust support.
   */

  fns.dust = fromStringRenderer('dust');

  /**
   * Dust string support.
   */

  fns.dust.render = function(str, options, fn){
    var engine = requires.dust;
    if (!engine) {
      try {
        engine = requires.dust = require(sailsAppPath + '/dust');
      } catch (err) {
        try {
          engine = requires.dust = require(sailsAppPath + '/dustjs-helpers');
        } catch (err) {
          engine = requires.dust = require(sailsAppPath + '/dustjs-linkedin');
        }
      }
    }

    var ext = 'dust'
      , views = '.';

    if (options) {
      if (options.ext) ext = options.ext;
      if (options.views) views = options.views;
      if (options.settings && options.settings.views) views = options.settings.views;
    }
    if (!options || (options && !options.cache)) engine.cache = {};

    engine.onLoad = function(path, callback){
      if ('' == extname(path)) path += '.' + ext;
      if ('/' !== path[0]) path = views + '/' + path;
      read(path, options, callback);
    };

    try {
      var tmpl = cache(options) || cache(options, engine.compileFn(str));
      tmpl(options, fn);
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Swig support.
   */

  fns.swig = fromStringRenderer('swig');

  /**
   * Swig string support.
   */

  fns.swig.render = function(str, options, fn){
    var engine = requires.swig || (requires.swig = require(sailsAppPath + '/swig'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Atpl support.
   */

  fns.atpl = fromStringRenderer('atpl');

  /**
   * Atpl string support.
   */

  fns.atpl.render = function(str, options, fn){
    var engine = requires.atpl || (requires.atpl = require(sailsAppPath + '/atpl'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Liquor support,
   */

  fns.liquor = fromStringRenderer('liquor');

  /**
   * Liquor string support.
   */

  fns.liquor.render = function(str, options, fn){
    var engine = requires.liquor || (requires.liquor = require(sailsAppPath + '/liquor'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * EJS support.
   */

  fns.ejs = fromStringRenderer('ejs');

  /**
   * EJS string support.
   */

  fns.ejs.render = function(str, options, fn){
    var engine = requires.ejs || (requires.ejs = require(sailsAppPath + '/ejs'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };


  /**
   * Eco support.
   */

  fns.eco = fromStringRenderer('eco');

  /**
   * Eco string support.
   */

  fns.eco.render = function(str, options, fn){
    var engine = requires.eco || (requires.eco = require(sailsAppPath + '/eco'));
    try {
      fn(null, engine.render(str, options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Jazz support.
   */

  fns.jazz = fromStringRenderer('jazz');

  /**
   * Jazz string support.
   */

  fns.jazz.render = function(str, options, fn){
    var engine = requires.jazz || (requires.jazz = require(sailsAppPath + '/jazz'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      tmpl.eval(options, function(str){
        fn(null, str);
      });
    } catch (err) {
      fn(err);
    }
  };

  /**
   * JQTPL support.
   */

  fns.jqtpl = fromStringRenderer('jqtpl');

  /**
   * JQTPL string support.
   */

  fns.jqtpl.render = function(str, options, fn){
    var engine = requires.jqtpl || (requires.jqtpl = require(sailsAppPath + '/jqtpl'));
    try {
      engine.template(str, str);
      fn(null, engine.tmpl(str, options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Haml support.
   */

  fns.haml = fromStringRenderer('haml');

  /**
   * Haml string support.
   */

  fns.haml.render = function(str, options, fn){
    var engine = requires.hamljs || (requires.hamljs = require(sailsAppPath + '/hamljs'));
    try {
      options.locals = options;
      fn(null, engine.render(str, options).trimLeft());
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Whiskers support.
   */

  fns.whiskers = function(path, options, fn){
    var engine = requires.whiskers || (requires.whiskers = require(sailsAppPath + '/whiskers'));
    engine.__express(path, options, fn);
  };

  /**
   * Whiskers string support.
   */

  fns.whiskers.render = function(str, options, fn){
    var engine = requires.whiskers || (requires.whiskers = require(sailsAppPath + '/whiskers'));
    try {
      fn(null, engine.render(str, options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Coffee-HAML support.
   */

  fns['haml-coffee'] = fromStringRenderer('haml-coffee');

  /**
   * Coffee-HAML string support.
   */

  fns['haml-coffee'].render = function(str, options, fn){
    var engine = requires.HAMLCoffee || (requires.HAMLCoffee = require(sailsAppPath + '/haml-coffee'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Hogan support.
   */

  fns.hogan = fromStringRenderer('hogan');

  /**
   * Hogan string support.
   */

  fns.hogan.render = function(str, options, fn){
    var engine = requires.hogan || (requires.hogan = require(sailsAppPath + '/hogan.js'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      fn(null, tmpl.render(options, options.partials));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * templayed.js support.
   */

  fns.templayed = fromStringRenderer('templayed');

  /**
   * templayed.js string support.
   */

  fns.templayed.render = function(str, options, fn){
    var engine = requires.templayed || (requires.templayed = require(sailsAppPath + '/templayed'));
    try {
      var tmpl = cache(options) || cache(options, engine(str));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Handlebars support.
   */

  fns.handlebars = fromStringRenderer('handlebars');

  /**
   * Handlebars string support.
   */

  fns.handlebars.render = function(str, options, fn) {
    var engine = requires.handlebars || (requires.handlebars = require(sailsAppPath + '/handlebars'));
    try {
      for (var partial in options.partials) {
        engine.registerPartial(partial, options.partials[partial]);
      }
      for (var helper in options.helpers) {
        engine.registerHelper(helper, options.helpers[helper]);
      }
      var tmpl = cache(options) || cache(options, engine.compile(str, options));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  }

  /**
   * Underscore support.
   */

  fns.underscore = fromStringRenderer('underscore');

  /**
   * Underscore string support.
   */

  fns.underscore.render = function(str, options, fn) {
    var engine = requires.underscore || (requires.underscore = require(sailsAppPath + '/underscore'));
    try {
      var tmpl = cache(options) || cache(options, engine.template(str, null, options));
      fn(null, tmpl(options).replace(/\n$/, ''));
    } catch (err) {
      fn(err);
    }
  };


  /**
   * QEJS support.
   */

  fns.qejs = function (path, options, fn) {
    try {
      var engine = requires.qejs || (requires.qejs = require(sailsAppPath + '/qejs'));
      engine.renderFile(path, options).then(function (result) {
          fn(null, result);
      }, function (err) {
          fn(err);
      }).end();
    } catch (err) {
      fn(err);
    }
  };

  /**
   * QEJS string support.
   */

  fns.qejs.render = function (str, options, fn) {
    try {
      var engine = requires.qejs || (requires.qejs = require(sailsAppPath + '/qejs'));
      engine.render(str, options).then(function (result) {
          fn(null, result);
      }, function (err) {
          fn(err);
      }).end();
    } catch (err) {
      fn(err);
    }
  };


  /**
   * Walrus support.
   */

  fns.walrus = fromStringRenderer('walrus');

  /**
   * Walrus string support.
   */

  fns.walrus.render = function (str, options, fn) {
    var engine = requires.walrus || (requires.walrus = require(sailsAppPath + '/walrus'));
    try {
      var tmpl = cache(options) || cache(options, engine.parse(str));
      fn(null, tmpl.compile(options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Mustache support.
   */

  fns.mustache = fromStringRenderer('mustache');

  /**
   * Mustache string support.
   */

  fns.mustache.render = function(str, options, fn) {
    var engine = requires.mustache || (requires.mustache = require(sailsAppPath + '/mustache'));
    try {
      fn(null, engine.to_html(str, options, options.partials));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Just support.
   */

  fns.just = function(path, options, fn){
    var engine = requires.just;
    if (!engine) {
      var JUST = require(sailsAppPath + '/just');
      engine = requires.just = new JUST();
    }
    engine.configure({ useCache: options.cache });
    engine.render(path, options, fn);
  };

  /**
   * Just string support.
   */

  fns.just.render = function(str, options, fn){
    var JUST = require(sailsAppPath + '/just');
    var engine = new JUST({ root: { page: str }});
    engine.render('page', options, fn);
  };

  /**
   * ECT support.
   */

  fns.ect = function(path, options, fn){
    var engine = requires.ect;
    if (!engine) {
      var ECT = require(sailsAppPath + '/ect');
      engine = requires.ect = new ECT();
    }
    engine.configure({ cache: options.cache });
    engine.render(path, options, fn);
  };

  /**
   * ECT string support.
   */

  fns.ect.render = function(str, options, fn){
    var ECT = require(sailsAppPath + '/ect');
    var engine = new ECT({ root: { page: str }});
    engine.render('page', options, fn);
  };

  /**
   * mote support.
   */

  fns.mote = fromStringRenderer('mote');

  /**
   * mote string support.
   */

  fns.mote.render = function(str, options, fn){
    var engine = requires.mote || (requires.mote = require(sailsAppPath + '/mote'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Toffee support.
   */

  fns.toffee = function(path, options, fn){
    var toffee = requires.toffee || (requires.toffee = require(sailsAppPath + '/toffee'));
    toffee.__consolidate_engine_render(path, options, fn);
  };

  /**
   * Toffee string support.
   */

  fns.toffee.render = function(str, options, fn) {
    var engine = requires.toffee || (requires.toffee = require(sailsAppPath + '/toffee'));
    try {
    	engine.str_render(str, options,fn);
    } catch (err) {
      fn(err);
    }
  };

  /**
   * doT support.
   */

  fns.dot = fromStringRenderer('dot');

  /**
   * doT string support.
   */

  fns.dot.render = function (str, options, fn) {
    var engine = requires.dot || (requires.dot = require(sailsAppPath + '/dot'));
    try {
      var tmpl = cache(options) || cache(options, engine.compile(str, options && options._def));
      fn(null, tmpl(options));
    } catch (err) {
      fn(err);
    }
  };    

  /**
   * Ractive support.
   */
    
  fns.ractive = fromStringRenderer('ractive');    
    
  /**
   * Ractive string support.
   */
    
  fns.ractive.render = function(str, options, fn){
    var engine = requires.ractive || (requires.ractive = require(sailsAppPath + '/ractive'));
    
    options.template = str;
    if (options.data === null || options.data === undefined)
    {
      options.data = options;
    }
    
    try {
        fn(null, new engine(options).renderHTML());
    } catch (err) {
      fn(err);
    }
  };

  /**
   * Nunjucks support.
   */    
   
  fns.nunjucks = fromStringRenderer('nunjucks');
    
  /**
   * Nunjucks string support.
   */
    
  fns.nunjucks.render = function(str, options, fn) {
    var engine = requires.nunjucks || (requires.nunjucks = require(sailsAppPath + 'nunjucks'));
    engine.renderString(str, options, fn);
  };

  return fns;

};