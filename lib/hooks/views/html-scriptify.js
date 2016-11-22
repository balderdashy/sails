/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var rttc = require('rttc');
var escapeHtmlEntitiesDeep = require('./escape-html-entities-deep');
var minifiedUnescapeHtmlEntitiesDeepLiteStr = require('./unescape-html-entities-deep-lite.min.string.js');


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
 *
 * --
 * Example usage:  (`sails console`)
 * sails> sails.hooks.views.htmlScriptify({data: {n: 'stuff<script>'}, dontUnescapeOnClient: true})
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
    html += ' var unescape = ' + minifiedUnescapeHtmlEntitiesDeepLiteStr + ';';

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

