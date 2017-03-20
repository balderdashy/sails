// This module exports the `toString()`-ed, minified version of the function defined below (`unescapeHtmlEntitiesDeepLite()`).
//
// We could do something fancier, but realistically, this shouldn't need to change much.
// If it does, the simplest thing to do is drop it into https://skalman.github.io/UglifyJS-online/
// then take the output from that, and run `toString()` on it in the Node REPL (that way you get
// single quotes, vs. the double-quotes you'll get in the Chrome JavaScript console.)
//
// Last generated at: 13:49:09 CDT, Sep 28, 2016
module.exports = 'function unescapeHtmlEntitiesDeepLite(r){if("function"!=typeof Array.isArray||"function"!=typeof Array.prototype.forEach||"function"!=typeof Array.prototype.map||"function"!=typeof Object.keys)throw Error("Unsupported browser: Missing support for `Array.isArray`, `Array.prototype.forEach`, `Array.prototype.map`, or `Object.keys`!  (Sails\' built-in HTML-unescaping for exposed locals supports IE9 and up.)");return function t(r){if(null===r)return r;if(r===!0||r===!1)return r;if("number"==typeof r)return r;if("string"==typeof r){var e=/&(?:amp|lt|gt|quot|#39|#96);/g,o=RegExp(e.source);if(""===r)return r;if(o.test(r)){var n={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":\'"\',"&#39;":"\'","&#96;":"`"};return r=r.replace(e,function(r){return n[r]})}return r}return Array.isArray(r)?r=r.map(function(r){return t(r)}):(Object.keys(r).forEach(function(e){r[e]=t(r[e],e)}),r)}(r)}';


// The rest of the code in this file is NEVER ACTUALLY USED DIRECTLY.
// It is here as a clear, simple point of reference for how the string above was generated.
// ==================================================================================================================

/**
 * Module dependencies
 */

// N/A

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// This logic DOES NOT rely on any dependencies.
// This is so that the function can be used in the browser, or on the server.
//
// This function is also sensitive to browser compatibility.
// (see http://kangax.github.io/compat-table/es5/ and check "Show obsolete platforms")
//
// The following code is based off of `_.unescape()` and `rttc.rebuild()`, the
// latter of which is itself influenced by isaac's `JSON.stringifySafe()`.
// (see https://github.com/isaacs/json-stringify-safe/commit/02cfafd45f06d076ac4bf0dd28be6738a07a72f9#diff-c3fcfbed30e93682746088e2ce1a4a24
//  but note that the cycle replacer, etc. have been removed for conciseness,
//  since this function can safely make the strict assumption that incoming
//  data is already guaranteed to be 100% bidirectionally JSON-compatible.)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Note that we leave the function below intact so that it can be statically analyzed.
// It is not actually used by backend code!!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/* eslint-disable no-unused-vars */

/**
 * unescapeHtmlEntitiesDeepLite()
 *
 * Recursively HTML-unescape all strings in the provided data (destructive).
 *
 * > • If the provided data contains any dictionaries or arrays, this traverses them recursively
 * >   and unescapes any deeply-nested strings.  Remember: any dictionaries/arrays in the original
 * >   value **will be mutated in-place**!
 * >
 * > • Also note that the provided value is assumed to already be 100% bidirectionally JSON-compatible.
 * >   That means no undefined values in arrays, or `Infinity`, etc!!  In other words, you should be
 * >   able to do JSON.stringify() on this data, then JSON.parse() the resulting string, and get _EXACTLY_
 * >   what you started with!
 *
 *
 * @param {JSONCompatible} data
 *           The data to escape. Must be 100% bidirectionally JSON-compatible-- which is stricter than normal! (see above)
 *
 * @returns {JSONCompatible}
 *          The provided data, which has now been destructively HTML-unescaped.
 */
function unescapeHtmlEntitiesDeepLite(data){

  // Check availability of features.
  // (Default unescaping supports IE 9 and up.
  //  If you need <=IE 8, etc check out http://kangax.github.io/compat-table/es5/#es5shim.
  //  For complete flexibility, you can also implement your own unescaping code.
  //  To do that, pass in `dontUnescapeOnClient: false` when calling the
  //  `exposeLocalsToBrowser()` view partial.)
  if (
    typeof Array.isArray !== 'function' ||
    typeof Array.prototype.forEach !== 'function' ||
    typeof Array.prototype.map !== 'function' ||
    typeof Object.keys !== 'function'
  ) {
    throw new Error('Unsupported browser: Missing support for `Array.isArray`, `Array.prototype.forEach`, `Array.prototype.map`, or `Object.keys`!  (Sails\' built-in HTML-unescaping for exposed locals supports IE9 and up.)');
  }


  // Now rebuild the data recursively.
  //
  // > This is a self-invoking recursive function.
  // > The initial call (made below) sets `thisVal` to `data`.
  return (function _unescapeRecursive (thisVal) {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // No need to worry about errors, regexps, dates, functions,
    // readable streams, buffers, constructors, Infinity, -Infinity,
    // or `-0` (negative zero).
    // ***(see note above about bidirectional-JSON-compatible-ness)***
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // If this is `null`, then leave it as-is.
    if (thisVal === null) {
      return thisVal;
    }
    // ‡
    // If this is a boolean, then leave it as-is.
    else if (thisVal === true || thisVal === false) {
      return thisVal;
    }
    // ‡
    // If this is a number, then leave it as-is.
    else if (typeof thisVal === 'number') {
      return thisVal;
    }
    // ‡
    // If this is a string, then convert any unsafe HTML entities it contains
    // into their decoded, real-world, life-on-the-streets character equivalents.
    else if (typeof thisVal === 'string') {

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // The code below is a port of the unescaping implementation from
      // within Lodash since v3.x, thru v4.x, and undoubtedly beyond.
      // It has been modified only to match the coding conventions and
      // context of Sails.
      //
      // For reference, see:
      //  • Entry point          - https://github.com/lodash/lodash/blob/3.10.1/lodash.js#L11008-L11031
      //                           (for future reference, see also https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L14932)
      //
      //  • RegExps              - https://github.com/lodash/lodash/blob/3.10.1/lodash.js#L81
      //                           (for future reference, see also https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L121)
      //
      //  • `unescapeHtmlChar()` - https://github.com/lodash/lodash/blob/3.10.1/lodash.js#L650-L659
      //                           (for future reference, see also https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L1333)
      //
      //  • `htmlUnescapes`      - https://github.com/lodash/lodash/blob/3.10.1/lodash.js#L215-L223
      //                           (for future reference, see also https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L376)
      //
      // > For future reference, see also `basePropertyOf`:
      // > https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L888
      // > (in Lodash 4.x, it's a waypoint between `unescapeHtmlChar()` and the `htmlUnescapes` constant)
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // Define RegExps for matching HTML entities.
      var X_ESCAPED_HTML = /&(?:amp|lt|gt|quot|#39|#96);/g;
      var X_HAS_ESCAPED_HTML = RegExp(X_ESCAPED_HTML.source);

      // If this is empty string, we can go ahead and bail (as an optimization.)
      // Also, another optimization: if it does not contain any HTML entities representing
      // unsafe characters, then we bail rather than wasting cycles on a `.replace()`.
      // Otherwise, that means we have to do a bit more work.  In this case, we'll replace
      // each one of those HTML entities with the corresponding unsafe character.
      if (thisVal === '') {
        return thisVal;
      }
      else if (!X_HAS_ESCAPED_HTML.test(thisVal)) {
        return thisVal;
      }
      else {
        var ENTITY_TO_CHAR_MAPPING = {
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': '\'',
          '&#96;': '`' // << note that this is only necessary because we're using the `_.escape()` from Lodash 3.10.1.
        };
        thisVal = thisVal.replace(X_ESCAPED_HTML, function (htmlEntityStr) {
          return ENTITY_TO_CHAR_MAPPING[htmlEntityStr];
        });
        return thisVal;
      }

    }//</if this is a string>
    // ‡
    // If this is an array, recursively unescape it.
    else if (Array.isArray(thisVal)) {
      thisVal = thisVal.map(function (item) {
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // No need to worry about stripping undefined items.
        // ***(see note above about bidirectional-JSON-compatible-ness)***
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        return _unescapeRecursive(item);
      });
      return thisVal;
    }
    // ‡
    // Otherwise, this must be an "object".  And since we know it's
    // neither `null` nor an array, we can safely assume it is a dictionary.
    // ***(see note above about bidirectional-JSON-compatible-ness)***
    //
    // So we'll recursively unescape it.
    else {
      Object.keys(thisVal).forEach(function (key) {
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // No need to worry about stripping keys with `undefined` values.
        // ***(see note above about bidirectional-JSON-compatible-ness)***
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        thisVal[key] = _unescapeRecursive(thisVal[key], key);
      });
      return thisVal;
    }

  })(data);//</invoked self-calling function :: _unescapeRecursive>

}
