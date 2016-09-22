/**
 * Module dependencies
 */

// N/A

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// This module exports a function which DOES NOT rely on any dependencies.
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
module.exports = function unescapeHtmlEntitiesDeepLite(data){

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
      //  • Entry point          - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L14932
      //  • RegExps              - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L121
      //  • `unescapeHtmlChar()` - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L1333
      //  • `basePropertyOf`     - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L888
      //  • `htmlUnescapes`      - https://github.com/lodash/lodash/blob/4.16.1/lodash.js#L376
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // Define RegExps for matching HTML entities.
      var X_ESCAPED_HTML = /&(?:amp|lt|gt|quot|#39);/g;
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
          '&#39;': '\''
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

};
