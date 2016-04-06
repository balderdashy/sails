/**
 * Module dependencies
 */

var _ = require('lodash');
var rttc = require('rttc');
var escapeHtmlEntitiesDeep = require('./escape-html-entities-deep');


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

  // Validate usage
  if (!_.isObject(options)) { throw new Error('Usage: A dictionary of options should be provided as the sole argument `htmlScriptify()`'); }
  // Check required properties
  else if (_.isUndefined(options.data)) { throw new Error('Usage: `data` is a required option'); }
  else if (!_.isObject(options.data)) { throw new Error('Usage: `data` should be a dictionary'); }
  // Check optional properties and apply defaults
  if (_.isUndefined(options.keys)) {
    // `options.keys` defaults to `undefined`-- meaning all keys in provided data
    // are permitted; i.e. no whitelist.
  }
  else {
    try { options.keys = rttc.validate(['string'], options.keys); }
    catch (e) {
      if (e.code === 'E_INVALID') { throw new Error('Usage: If provided, `keys` should be an array of strings'); }
      else { throw e; }
    }
  }
  if (_.isUndefined(options.namespace)) { options.namespace = 'SAILS_LOCALS'; }
  else {
    // Note that while we might also consider validating `namespace` as an
    // ecmascript-compatible variable name, in the interest of avoiding any
    // more dependencies here, we do not.
    try { options.namespace = rttc.validate('string', options.namespace); }
    catch (e) {
      if (e.code === 'E_INVALID') { throw new Error('Usage: If provided, `namespace` should be a string'); }
      else { throw e; }
    }
  }
  if (_.isUndefined(options.dontUnescapeOnClient)) { options.dontUnescapeOnClient = false; }
  else {
    try { options.dontUnescapeOnClient = rttc.validate('boolean', options.dontUnescapeOnClient); }
    catch (e) {
      if (e.code === 'E_INVALID') { throw new Error('Usage: If provided, `dontUnescapeOnClient` should be either `true` or `false`'); }
      else { throw e; }
    }
  }

  // console.log('options.data',options.data);
  // console.log('_.keys(options.data)',_.keys(options.data));

  // Build and return HTML to inject.
  var html = '<script type="text/javascript">';
  html += ' (function (){ ';
  // Unless `dontUnescapeOnClient` flag was enabled, don't build the code
  // to do the unescaping. (useful for customizing client-side unescaping logic)
  if (!options.dontUnescapeOnClient) {
    // Inject client-side JavaScript code that will be used to unescape the
    // bootstrapped data.
    //
    // This is kind of like _.unescape().
    // (see https://github.com/lodash/lodash/blob/4.7.0/dist/lodash.js#L14038)
    // Except it also has to be recursive.  But luckily, we don't have to worry
    // about circular references, since we know this was just serialized.
    html += ' var unescape = ' + (function clientSideUnescapeFn(escapedValue){
      var unescapedValue = escapedValue;
      // TODO: actually unescape it
      //
      // This may kind of suck because it needs to be vanilla JS.
      // Not planning on any kind of special backwards-compatible support for older browsers,
      // but if that IS needed, or any other customizations to the client-side escaping code
      // are necessary, then the built-in client-side escaping can be disabled using
      // `dontUnescapeOnClient: true`.
      return unescapedValue;
    }).toString() + '; ';
  }
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

    // Now, dive into `unsafeVal` and recursively HTML-escape any nested strings
    // and compile the whole thing into a JavaScript string which will accurately
    // represent it as an r-value (watching out for circular refs along the way).
    if (!options.dontUnescapeOnClient) {
      html += ''+key+': unescape('+rttc.compile(escapeHtmlEntitiesDeep(unsafeVal))+'),';
    }
    else {
      html += ''+key+': '+rttc.compile(escapeHtmlEntitiesDeep(unsafeVal))+',';
    }
  });
  html += ' }; ';
  html += ' })(); ';
  html += '</script>';

  return html;


  // ~Example usage:
  // ============================================================
  // xss-test: ∑ sails console
  //
  // info: Starting app in interactive mode...
  //
  // info: Welcome to the Sails console.
  // info: ( to exit, type <CTRL>+<C> )
  //
  // sails> sails.hooks.views.htmlScriptify({data: {3: 'stuff'}, keys: ['4'], namespace: '32', dontUnescapeOnClient: true})
  // '<script type="text/javascript"> (function (){  window.32 = {  };  })(); </script>'
  // sails> sails.hooks.views.htmlScriptify({data: {3: 'stuff'}, keys: ['3'], namespace: '32'})
  // '<script type="text/javascript"> (function (){  var unescape = function (u){\n      // TODO: implement `unescape()`\n      return u;\n    };  window.32 = { 3: unescape(\'stuff\'), };  })(); </script>'
  // sails> sails.hooks.views.htmlScriptify({data: {3: 'stuff'}})
  // '<script type="text/javascript"> (function (){  var unescape = function (u){\n      // TODO: implement `unescape()`\n      // (see https://github.com/lodash/lodash/blob/4.7.0/dist/lodash.js#L14038)\n      return u;\n    };  window.SAILS_LOCALS = { 3: unescape(\'stuff\'), };  })(); </script>'

  // ~Example of end result:
  // ============================================================
  //
  // <script type="text/javascript">
  //   window.SAILS_LOCALS = {
  //     _csrf: (function (escapedValue){
  //       var unescaped = escapedValue;
  //       // Unescape all strings in `escapedValue`.
  //       // (recursively parse escapedValue if it is an array or dictionary)
  //       // (also need to prevent endless circular recursion for circular objects)
  //       return unescaped;
  //     })('d8a831-d8a8381h1-adgadga3'),

  //     me: (function (escapedValue){
  //       var unescaped = escapedValue;
  //       // Unescape all strings in `escapedValue`.
  //       // (recursively parse escapedValue if it is an array or dictionary)
  //       // (also need to prevent endless circular recursion for circular objects)
  //       return unescaped;
  //     })({
  //       gravatarUrl: '&lt;/script&gt;',
  //       admin: false
  //     })
  //   };
  // </script>

};
