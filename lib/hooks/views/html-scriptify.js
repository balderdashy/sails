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
 *           The dictionary (i.e. of locals) that will be converted into an HTML snippet containing our script tag. If any keys (e.g. _ or sails) are not JSON-serializable (i.e. strings, numbers, booleans, plain dictionaries, arrays, and null), they are simply excluded.
 *
 * @optional {Array} options.keys
 *           An array of strings; the names of keys in data which should be exposed to on the namespace. If left unspecified, all keys in data will be exposed.
 *
 * @optional {String} options.namespace
 *           The name of the key on the window object where data should be exposed. Defaults to 'SAILS_LOCALS'.
 *
 * @optional {Boolean} options.dontUnescapeOnClient
 *           Defaults to false. When false (by default) client-side JavaScript code will be injected around the exposed data. When the page loads, the injected client-side JavaScript runs, unescaping the values so that they are accessible to client-side JavaScript with no further transformation necessary (i.e. they are immediately usable just like they would be if they had been fetched using AJAX). If this flag is enabled, no additional client-side JavaScript code will be injected and so the exposed values will be unescaped (e.g. window.SAILS_LOCALS.funnyFace === '&lt;o_o&gt;')
 *
 *
 * @returns {String} a string of HTML code-- specifically a script tag containing the exposed data.
 */
module.exports = function htmlScriptify(options){

  // Validate usage
  // TODO
  //
  // isUndefined();
  // isObject();
  // isArray();
  // isString();
  // isBoolean();

  console.log('options.data',options.data);
  console.log('_.keys(options.data)',_.keys(options.data));

  // Build and return HTML to inject.
  var html = '<script type="text/javascript">';
  html += ' (function (){ ';
  html += ' var unescape = ' + (function (u){
    // TODO: implement `unescape()`
    return u;
  }).toString() + '; ';
  html += ' window.SAILS_LOCALS = { ';
  _.each(_.keys(options.data),function (key){
   // Dive into val and recursively HTML-escape any nested strings:
   // (watch out for circular refs)
   var safeVal = escapeHtmlEntitiesDeep(options.data[key]);
   html += ''+key+': unescape('+rttc.compile(safeVal)+'),';
  });
  html += ' }; ';
  html += ' })(); ';
  html += '</script>';

  return html;

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
