/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var rttc = require('rttc');
var escapeHtmlEntitiesDeep = require('./escape-html-entities-deep');
var unescapeHtmlEntitiesDeepLite = require('./unescape-html-entities-deep-lite');


/**
 * htmlScriptify()
 *
 * Generate a string of HTML code that can be injected onto a page
 * in order to expose a JSON-serializable version of the provided
 * data to client-side JavaScript.
 *
 * @required {Dictionary} options.data
 *           The dictionary (i.e. of locals) that will be converted into an HTML snippet containing
 *           our script tag. If any of the keys cannot be coerced to be JSON-serializable (i.e.
 *           contain nothing that isn't a string, number, boolean, plain dictionary, array, or null),
 *           then they are simply excluded.  Additionally, each key is recursively parsed to snip off
 *           any circular references and otherwise ensure full JSON-serializability of ever nested key
 *           therein.  See rttc.dehydrate() for more information.
 *
 * @optional {Array} options.keys
 *           An array of strings; the names of keys in data which should be exposed to on the namespace. If left unspecified, all keys in data will be exposed.
 *
 * @optional {String} options.namespace
 *           The name of the key on the window object where data should be exposed. Defaults to 'SAILS_LOCALS'.
 *
 * @optional {Boolean} options.dontUnescapeOnClient
 *           Defaults to false. When false (by default) client-side JavaScript code will be
 *           injected around the exposed data. When the page loads, the injected client-side
 *           JavaScript runs, unescaping the values so that they are accessible to client-side
 *           JavaScript with no further transformation necessary (i.e. they are immediately
 *           usable just like they would be if they had been fetched using AJAX). If this flag
 *           is enabled, no additional client-side JavaScript code will be injected and so the
 *           exposed values will still be escaped; e.g. `window.SAILS_LOCALS.funnyFace === '&lt;o_o&gt;'`
 *           (this is useful for customizing client-side unescaping logic)
 *
 *
 * @returns {String} a string of HTML code-- specifically a script tag containing the exposed data.
 */
module.exports = function htmlScriptify(options){

  //  ██╗   ██╗ █████╗ ██╗     ██╗██████╗  █████╗ ████████╗███████╗    ██╗   ██╗███████╗ █████╗  ██████╗ ███████╗
  //  ██║   ██║██╔══██╗██║     ██║██╔══██╗██╔══██╗╚══██╔══╝██╔════╝    ██║   ██║██╔════╝██╔══██╗██╔════╝ ██╔════╝
  //  ██║   ██║███████║██║     ██║██║  ██║███████║   ██║   █████╗      ██║   ██║███████╗███████║██║  ███╗█████╗
  //  ╚██╗ ██╔╝██╔══██║██║     ██║██║  ██║██╔══██║   ██║   ██╔══╝      ██║   ██║╚════██║██╔══██║██║   ██║██╔══╝
  //   ╚████╔╝ ██║  ██║███████╗██║██████╔╝██║  ██║   ██║   ███████╗    ╚██████╔╝███████║██║  ██║╚██████╔╝███████╗
  //    ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝     ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
  //
  if (!_.isObject(options)) {
    throw new Error('Usage: A dictionary of options should be provided as the sole argument `htmlScriptify()`');
  }

  // Verify `data`.
  if (_.isUndefined(options.data)) {
    throw new Error('Usage: `data` is a required option');
  }
  if (!_.isObject(options.data) || _.isArray(options.data) || _.isFunction(options.data)) {
    throw new Error(
      'Usage: `data` should be provided as a dictionary.  But instead, got: '+
      util.inspect(options.data,{depth:null})
    );
  }//--•

  // Verify `keys`, if provided.
  //
  // > If unspecified, we leave `options.keys` as `undefined`.
  // > (this indicates that all keys in provided data are permitted; i.e. no whitelist.)
  if (!_.isUndefined(options.keys)) {
    try {
      options.keys = rttc.validate(['string'], options.keys);
    } catch (e) {
      if (e.code === 'E_INVALID') {
        throw new Error('Usage: If provided, `keys` should be an array of strings');
      } else { throw e; }
    }
  }//--•
  else {
    // (if unspecified, we leave `options.keys` as `undefined`)
  }//>-

  // Verify `namespace`, if provided (or use default)
  //
  // > Note that while we might also consider validating `namespace` as an
  // > ecmascript-compatible variable name, in the interest of avoiding any
  // > more dependencies here, we do not.
  if (!_.isUndefined(options.namespace)) {
    try {
      options.namespace = rttc.validate('string', options.namespace);
    } catch (e) {
      if (e.code === 'E_INVALID') {
        throw new Error('Usage: If provided, `namespace` should be a string');
      } else { throw e; }
    }
  }
  else {
    options.namespace = 'SAILS_LOCALS';
  }//>-

  // Verify `dontUnescapeOnClient` flag, if provided (or use default)
  //
  // > If special backwards-compatible support for older browsers is needed, or any
  // > other customizations to the client-side escaping code are necessary, then
  // > the built-in client-side escaping can be disabled using `dontUnescapeOnClient: true`.
  if (!_.isUndefined(options.dontUnescapeOnClient)) {
    try {
      options.dontUnescapeOnClient = rttc.validate('boolean', options.dontUnescapeOnClient);
    } catch (e) {
      if (e.code === 'E_INVALID') { throw new Error('Usage: If provided, `dontUnescapeOnClient` should be either `true` or `false`'); }
      else { throw e; }
    }
  }
  else {
    options.dontUnescapeOnClient = false;
  }//>-

  // console.log('options.data',options.data);
  // console.log('_.keys(options.data)',_.keys(options.data));


  //  ██████╗ ██╗   ██╗██╗██╗     ██████╗     ██╗  ██╗████████╗███╗   ███╗██╗
  //  ██╔══██╗██║   ██║██║██║     ██╔══██╗    ██║  ██║╚══██╔══╝████╗ ████║██║
  //  ██████╔╝██║   ██║██║██║     ██║  ██║    ███████║   ██║   ██╔████╔██║██║
  //  ██╔══██╗██║   ██║██║██║     ██║  ██║    ██╔══██║   ██║   ██║╚██╔╝██║██║
  //  ██████╔╝╚██████╔╝██║███████╗██████╔╝    ██║  ██║   ██║   ██║ ╚═╝ ██║███████╗
  //  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝╚══════╝
  //
  //  ████████╗ ██████╗     ██████╗ ███████╗████████╗██╗   ██╗██████╗ ███╗   ██╗
  //  ╚══██╔══╝██╔═══██╗    ██╔══██╗██╔════╝╚══██╔══╝██║   ██║██╔══██╗████╗  ██║
  //     ██║   ██║   ██║    ██████╔╝█████╗     ██║   ██║   ██║██████╔╝██╔██╗ ██║
  //     ██║   ██║   ██║    ██╔══██╗██╔══╝     ██║   ██║   ██║██╔══██╗██║╚██╗██║
  //     ██║   ╚██████╔╝    ██║  ██║███████╗   ██║   ╚██████╔╝██║  ██║██║ ╚████║
  //     ╚═╝    ╚═════╝     ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝
  //
  // Build and return HTML to inject.
  var html = '<script type="text/javascript">';
  html += ' (function (){ ';

  // By default, we inject client-side code to perform unescaping.
  // But if the `dontUnescapeOnClient` flag was enabled, then we don't build the
  // code to do the unescaping. (useful for customizing client-side unescaping logic;
  // e.g. for legacy browser compatibility <= IE 8)
  if (!options.dontUnescapeOnClient) {

    // Inject client-side JavaScript code that will be used to unescape the
    // bootstrapped data.
    //
    // This is kind of like _.unescape()...except it also has to be recursive.
    // Luckily, we don't have to worry about circular references or any of the
    // other not-quite-JSON stuff, since we know this was just serialized.
    html += ' var unescape = ' + unescapeHtmlEntitiesDeepLite.toString() + ';';

  }//</if :: needed to inject client-side unescape function (`dontUnescapeOnClient` flag was NOT enabled)>
  //>-

  html += ' window.'+options.namespace+' = { ';

  // Determine the relevant keys to inject.
  // (filtering using `options.keys` whitelist, if provided)
  var keysToInject = _.keys(options.data);
  if (!_.isUndefined(options.keys)) {
    keysToInject = _.intersection(keysToInject, options.keys);
  }

  // Then inject them in our <script> tag string.
  _.each(keysToInject, function eachRelevantKey(key){
    var unsafeVal = options.data[key];

    // If this top-level key in the provided data is undefined, exclude it altogether.
    if (_.isUndefined(unsafeVal)) { return; }

    // Now, dive into `unsafeVal` and recursively HTML-escape any nested strings.
    // Then, compile the whole thing into a JavaScript string which will accurately
    // represent it as an r-value (watching out for circular refs along the way).
    var escapedData = rttc.compile(escapeHtmlEntitiesDeep(unsafeVal));

    // If the `dontUnescapeOnClient` flag was set, then just stick the compiled,
    // still-HTML-escaped data in place.  (It will have to be recursively unescaped
    // by hand in the app's custom client-side code!)
    if (options.dontUnescapeOnClient) {
      html += ''+key+': '+escapedData+',';
    }
    // Otherwise, we're including the client-side code to unescape the data,
    // so run our unescape function from above.
    else {
      html += ''+key+': unescape('+escapedData+'),';
    }
  });
  html += ' }; ';
  html += ' })(); ';
  html += '</script>';

  return html;

};


//
// ~Example usage:
// ============================================================
// xss-test: ∑ sails console
//
// info: Starting app in interactive mode...
//
// info: Welcome to the Sails console.
// info: ( to exit, type <CTRL>+<C> )
//
// sails> sails.hooks.views.htmlScriptify({data: {n: 'stuff<script>'}, dontUnescapeOnClient: true})
// '<script type="text/javascript"> (function (){  window.SAILS_LOCALS = { n: \'stuff&lt;script&gt;\', };  })(); </script>'
//
// sails> sails.hooks.views.htmlScriptify({data: {3: 'stuff', other: 32823}, keys: ['4'], namespace: 'foo', dontUnescapeOnClient: true})
// '<script type="text/javascript"> (function (){  window.foo = {  };  })(); </script>'
//
// sails> sails.hooks.views.htmlScriptify({data: {asdf: ['bleh'], 3: 'stuff'}, keys: ['3'] })
// '<script type="text/javascript"> (function (){  var unescape = function unescapeHtmlEntitiesDeepLite(data){\n\n  // Check availability of features.\n  // (Default unescaping supports IE 9 and up.\n  //  If you need <=IE 8, etc check out http://kangax.github.io/compat-table/es5/#es5shim.\n  //  For complete flexibility, you can also implement your own unescaping code.\n  //  To do that, pass in `dontUnescapeOnClient: false` when calling the\n  //  `exposeLocalsToBrowser()` view partial.)\n  if (\n    typeof Array.isArray !== \'function\' ||\n    typeof Array.prototype.forEach !== \'function\' ||\n    typeof Array.prototype.map !== \'function\' ||\n    typeof Object.keys !== \'function\'\n  ) {\n    throw new Error(\'Unsupported browser: Missing support for `Array.isArray`, `Array.prototype.forEach`, `Array.prototype.map`, or `Object.keys`!  (Sails\\\' built-in HTML-unescaping for exposed locals supports IE9 and up.)\');\n  }\n\n\n  // Now rebuild the data recursively.\n  //\n  // > This is a self-invoking recursive function.\n  // > The initial call (made below) sets `thisVal` to `data`.\n  return (function _unescapeRecursive (thisVal) {\n\n    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n    // No need to worry about errors, regexps, dates, functions,\n    // readable streams, buffers, constructors, Infinity, -Infinity,\n    // or `-0` (negative zero).\n    // ***(see note above about bidirectional-JSON-compatible-ness)***\n    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n    // If this is `null`, then leave it as-is.\n    if (thisVal === null) {\n      return thisVal;\n    }\n    // ‡\n    // If this is a boolean, then leave it as-is.\n    else if (thisVal === true || thisVal === false) {\n      return thisVal;\n    }\n    // ‡\n    // If this is a number, then leave it as-is.\n    else if (typeof thisVal === \'number\') {\n      return thisVal;\n    }\n    // ‡\n    // If this is a string, then convert any unsafe HTML entities it contains\n    // into their decoded, real-world, life-on-the-streets character equivalents.\n    else if (typeof thisVal === \'string\') {\n\n      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n      // The code below is a port of the unescaping implementation from\n      // within Lodash since v3.x, thru v4.x, and undoubtedly beyond.\n      // It has been modified only to match the coding conventions and\n      // context of Sails.\n      //\n      // For reference, see:\n      //  • Entry point          - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L14932\n      //  • RegExps              - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L121\n      //  • `unescapeHtmlChar()` - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L1333\n      //  • `basePropertyOf`     - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L888\n      //  • `htmlUnescapes`      - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L376\n      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n      // Define RegExps for matching HTML entities.\n      var X_ESCAPED_HTML = /&(?:amp|lt|gt|quot|#39);/g;\n      var X_HAS_ESCAPED_HTML = RegExp(X_ESCAPED_HTML.source);\n\n      // If this is empty string, we can go ahead and bail (as an optimization.)\n      // Also, another optimization: if it does not contain any HTML entities representing\n      // unsafe characters, then we bail rather than wasting cycles on a `.replace()`.\n      // Otherwise, that means we have to do a bit more work.  In this case, we\'ll replace\n      // each one of those HTML entities with the corresponding unsafe character.\n      if (thisVal === \'\') {\n        return thisVal;\n      }\n      else if (!X_HAS_ESCAPED_HTML.test(thisVal)) {\n        return thisVal;\n      }\n      else {\n        var ENTITY_TO_CHAR_MAPPING = {\n          \'&amp;\': \'&\',\n          \'&lt;\': \'<\',\n          \'&gt;\': \'>\',\n          \'&quot;\': \'"\',\n          \'&#39;\': \'\\\'\'\n        };\n        thisVal = thisVal.replace(X_ESCAPED_HTML, function (htmlEntityStr) {\n          return ENTITY_TO_CHAR_MAPPING[htmlEntityStr];\n        });\n        return thisVal;\n      }\n\n    }//</if this is a string>\n    // ‡\n    // If this is an array, recursively unescape it.\n    else if (Array.isArray(thisVal)) {\n      thisVal = thisVal.map(function (item) {\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        // No need to worry about stripping undefined items.\n        // ***(see note above about bidirectional-JSON-compatible-ness)***\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        return _unescapeRecursive(item);\n      });\n      return thisVal;\n    }\n    // ‡\n    // Otherwise, this must be an "object".  And since we know it\'s\n    // neither `null` nor an array, we can safely assume it is a dictionary.\n    // ***(see note above about bidirectional-JSON-compatible-ness)***\n    //\n    // So we\'ll recursively unescape it.\n    else {\n      Object.keys(thisVal).forEach(function (key) {\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        // No need to worry about stripping keys with `undefined` values.\n        // ***(see note above about bidirectional-JSON-compatible-ness)***\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        thisVal[key] = _unescapeRecursive(thisVal[key], key);\n      });\n      return thisVal;\n    }\n\n  })(data);//</invoked self-calling function :: _unescapeRecursive>\n\n}; window.SAILS_LOCALS = { 3: unescape(\'stuff\'), };  })(); </script>'
//
// sails.hooks.views.htmlScriptify({data: {asdf: ['bleh'], 3: 'stuff'}, keys: ['3'] })
// '<script type="text/javascript"> (function (){  var unescape = function unescapeHtmlEntitiesDeepLite(data){\n\n  // Check availability of features.\n  // (Default unescaping supports IE 9 and up.\n  //  If you need <=IE 8, etc check out http://kangax.github.io/compat-table/es5/#es5shim.\n  //  For complete flexibility, you can also implement your own unescaping code.\n  //  To do that, pass in `dontUnescapeOnClient: false` when calling the\n  //  `exposeLocalsToBrowser()` view partial.)\n  if (\n    typeof Array.isArray !== \'function\' ||\n    typeof Array.prototype.forEach !== \'function\' ||\n    typeof Array.prototype.map !== \'function\' ||\n    typeof Object.keys !== \'function\'\n  ) {\n    throw new Error(\'Unsupported browser: Missing support for `Array.isArray`, `Array.prototype.forEach`, `Array.prototype.map`, or `Object.keys`!  (Sails\\\' built-in HTML-unescaping for exposed locals supports IE9 and up.)\');\n  }\n\n\n  // Now rebuild the data recursively.\n  //\n  // > This is a self-invoking recursive function.\n  // > The initial call (made below) sets `thisVal` to `data`.\n  return (function _unescapeRecursive (thisVal) {\n\n    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n    // No need to worry about errors, regexps, dates, functions,\n    // readable streams, buffers, constructors, Infinity, -Infinity,\n    // or `-0` (negative zero).\n    // ***(see note above about bidirectional-JSON-compatible-ness)***\n    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n    // If this is `null`, then leave it as-is.\n    if (thisVal === null) {\n      return thisVal;\n    }\n    // ‡\n    // If this is a boolean, then leave it as-is.\n    else if (thisVal === true || thisVal === false) {\n      return thisVal;\n    }\n    // ‡\n    // If this is a number, then leave it as-is.\n    else if (typeof thisVal === \'number\') {\n      return thisVal;\n    }\n    // ‡\n    // If this is a string, then convert any unsafe HTML entities it contains\n    // into their decoded, real-world, life-on-the-streets character equivalents.\n    else if (typeof thisVal === \'string\') {\n\n      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n      // The code below is a port of the unescaping implementation from\n      // within Lodash since v3.x, thru v4.x, and undoubtedly beyond.\n      // It has been modified only to match the coding conventions and\n      // context of Sails.\n      //\n      // For reference, see:\n      //  • Entry point          - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L14932\n      //  • RegExps              - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L121\n      //  • `unescapeHtmlChar()` - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L1333\n      //  • `basePropertyOf`     - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L888\n      //  • `htmlUnescapes`      - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L376\n      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n      // Define RegExps for matching HTML entities.\n      var X_ESCAPED_HTML = /&(?:amp|lt|gt|quot|#39);/g;\n      var X_HAS_ESCAPED_HTML = RegExp(X_ESCAPED_HTML.source);\n\n      // If this is empty string, we can go ahead and bail (as an optimization.)\n      // Also, another optimization: if it does not contain any HTML entities representing\n      // unsafe characters, then we bail rather than wasting cycles on a `.replace()`.\n      // Otherwise, that means we have to do a bit more work.  In this case, we\'ll replace\n      // each one of those HTML entities with the corresponding unsafe character.\n      if (thisVal === \'\') {\n        return thisVal;\n      }\n      else if (!X_HAS_ESCAPED_HTML.test(thisVal)) {\n        return thisVal;\n      }\n      else {\n        var ENTITY_TO_CHAR_MAPPING = {\n          \'&amp;\': \'&\',\n          \'&lt;\': \'<\',\n          \'&gt;\': \'>\',\n          \'&quot;\': \'"\',\n          \'&#39;\': \'\\\'\'\n        };\n        thisVal = thisVal.replace(X_ESCAPED_HTML, function (htmlEntityStr) {\n          return ENTITY_TO_CHAR_MAPPING[htmlEntityStr];\n        });\n        return thisVal;\n      }\n\n    }//</if this is a string>\n    // ‡\n    // If this is an array, recursively unescape it.\n    else if (Array.isArray(thisVal)) {\n      thisVal = thisVal.map(function (item) {\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        // No need to worry about stripping undefined items.\n        // ***(see note above about bidirectional-JSON-compatible-ness)***\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        return _unescapeRecursive(item);\n      });\n      return thisVal;\n    }\n    // ‡\n    // Otherwise, this must be an "object".  And since we know it\'s\n    // neither `null` nor an array, we can safely assume it is a dictionary.\n    // ***(see note above about bidirectional-JSON-compatible-ness)***\n    //\n    // So we\'ll recursively unescape it.\n    else {\n      Object.keys(thisVal).forEach(function (key) {\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        // No need to worry about stripping keys with `undefined` values.\n        // ***(see note above about bidirectional-JSON-compatible-ness)***\n        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -\n        thisVal[key] = _unescapeRecursive(thisVal[key], key);\n      });\n      return thisVal;\n    }\n\n  })(data);//</invoked self-calling function :: _unescapeRecursive>\n\n}; window.SAILS_LOCALS = { 3: unescape(\'stuff\'), };  })(); </script>'
//
// ~Example of end result:
// ============================================================
//
// <script type="text/javascript"> (function (){  var unescape = function unescapeHtmlEntitiesDeepLite(data){

//   // Check availability of features.
//   // (Default unescaping supports IE 9 and up.
//   //  If you need <=IE 8, etc check out http://kangax.github.io/compat-table/es5/#es5shim.
//   //  For complete flexibility, you can also implement your own unescaping code.
//   //  To do that, pass in `dontUnescapeOnClient: false` when calling the
//   //  `exposeLocalsToBrowser()` view partial.)
//   if (
//     typeof Array.isArray !== 'function' ||
//     typeof Array.prototype.forEach !== 'function' ||
//     typeof Array.prototype.map !== 'function' ||
//     typeof Object.keys !== 'function'
//   ) {
//     throw new Error('Unsupported browser: Missing support for `Array.isArray`, `Array.prototype.forEach`, `Array.prototype.map`, or `Object.keys`!  (Sails\' built-in HTML-unescaping for exposed locals supports IE9 and up.)');
//   }


//   // Now rebuild the data recursively.
//   //
//   // > This is a self-invoking recursive function.
//   // > The initial call (made below) sets `thisVal` to `data`.
//   return (function _unescapeRecursive (thisVal) {

//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//     // No need to worry about errors, regexps, dates, functions,
//     // readable streams, buffers, constructors, Infinity, -Infinity,
//     // or `-0` (negative zero).
//     // ***(see note above about bidirectional-JSON-compatible-ness)***
//     // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//     // If this is `null`, then leave it as-is.
//     if (thisVal === null) {
//       return thisVal;
//     }
//     // ‡
//     // If this is a boolean, then leave it as-is.
//     else if (thisVal === true || thisVal === false) {
//       return thisVal;
//     }
//     // ‡
//     // If this is a number, then leave it as-is.
//     else if (typeof thisVal === 'number') {
//       return thisVal;
//     }
//     // ‡
//     // If this is a string, then convert any unsafe HTML entities it contains
//     // into their decoded, real-world, life-on-the-streets character equivalents.
//     else if (typeof thisVal === 'string') {

//       // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//       // The code below is a port of the unescaping implementation from
//       // within Lodash since v3.x, thru v4.x, and undoubtedly beyond.
//       // It has been modified only to match the coding conventions and
//       // context of Sails.
//       //
//       // For reference, see:
//       //  • Entry point          - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L14932
//       //  • RegExps              - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L121
//       //  • `unescapeHtmlChar()` - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L1333
//       //  • `basePropertyOf`     - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L888
//       //  • `htmlUnescapes`      - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L376
//       // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

//       // Define RegExps for matching HTML entities.
//       var X_ESCAPED_HTML = /&(?:amp|lt|gt|quot|#39);/g;
//       var X_HAS_ESCAPED_HTML = RegExp(X_ESCAPED_HTML.source);

//       // If this is empty string, we can go ahead and bail (as an optimization.)
//       // Also, another optimization: if it does not contain any HTML entities representing
//       // unsafe characters, then we bail rather than wasting cycles on a `.replace()`.
//       // Otherwise, that means we have to do a bit more work.  In this case, we'll replace
//       // each one of those HTML entities with the corresponding unsafe character.
//       if (thisVal === '') {
//         return thisVal;
//       }
//       else if (!X_HAS_ESCAPED_HTML.test(thisVal)) {
//         return thisVal;
//       }
//       else {
//         var ENTITY_TO_CHAR_MAPPING = {
//           '&amp;': '&',
//           '&lt;': '<',
//           '&gt;': '>',
//           '&quot;': '"',
//           '&#39;': '\''
//         };
//         thisVal = thisVal.replace(X_ESCAPED_HTML, function (htmlEntityStr) {
//           return ENTITY_TO_CHAR_MAPPING[htmlEntityStr];
//         });
//         return thisVal;
//       }

//     }//</if this is a string>
//     // ‡
//     // If this is an array, recursively unescape it.
//     else if (Array.isArray(thisVal)) {
//       thisVal = thisVal.map(function (item) {
//         // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//         // No need to worry about stripping undefined items.
//         // ***(see note above about bidirectional-JSON-compatible-ness)***
//         // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//         return _unescapeRecursive(item);
//       });
//       return thisVal;
//     }
//     // ‡
//     // Otherwise, this must be an "object".  And since we know it's
//     // neither `null` nor an array, we can safely assume it is a dictionary.
//     // ***(see note above about bidirectional-JSON-compatible-ness)***
//     //
//     // So we'll recursively unescape it.
//     else {
//       Object.keys(thisVal).forEach(function (key) {
//         // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//         // No need to worry about stripping keys with `undefined` values.
//         // ***(see note above about bidirectional-JSON-compatible-ness)***
//         // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//         thisVal[key] = _unescapeRecursive(thisVal[key], key);
//       });
//       return thisVal;
//     }

//   })(data);//</invoked self-calling function :: _unescapeRecursive>

// }; window.SAILS_LOCALS = { _csrf: unescape('KKqVlrrI-UiBcJo-ySS1vBuoV7nOo9YLF3YE'),xssAttack: unescape('&#39;;alert(String.fromCharCode(88,83,83))//&#39;;alert(String.fromCharCode(88,83,83))//&quot;;\nalert(String.fromCharCode(88,83,83))//&quot;;alert(String.fromCharCode(88,83,83))//--\n&gt;&lt;/SCRIPT&gt;&quot;&gt;&#39;&gt;&lt;SCRIPT&gt;alert(String.fromCharCode(88,83,83))&lt;/SCRIPT&gt;'), };  })(); </script>

