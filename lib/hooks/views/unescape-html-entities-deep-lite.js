/**
 * Module dependencies
 */

// N/A

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// This module exports a function which DOES NOT rely on any dependencies.
// This is so that the function can be used in the browser, or on the server.
//
// This function is also sensitive to browser compatibility.
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

  // If `data` is undefined at the top level, leave it as `undefined`.
  if (typeof data === undefined) {
    return undefined;
  }

  // Temporarily require lodash in order to test this migration one piece at a time
  var _ = require('lodash');
  // TODO remove! ^^^^

  var stack = [];
  var keys = [];

  // Now rebuild the data recursively.
  //
  // > This is a self-invoking recursive function.
  // > The initial call (made below) sets `thisVal` to `data`, and `key` to "" (empty string).
  return (function _unescapeRecursive (thisVal, key) {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // No need to worry about errors, regexps, dates, functions,
    // readable streams, buffers, constructors, Infinity, -Infinity,
    // or `-0` (negative zero).
    // ***(see note above about bidirectional-JSON-compatible-ness)***
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // If this is `null`, a boolean, or a number, then leave it as-is.
    if (thisVal === null) {
      return thisVal;
    }
    else if (thisVal === true || thisVal === false) {
      return thisVal;
    }
    else if (typeof thisVal === 'number') {
      return thisVal;
    }
    // If this is a string, then unescape it.
    else if (typeof thisVal === 'string') {
      return _.unescape(thisVal);
    }
    // If this is an array, recursively unescape it.
    else if (_.isArray(thisVal)) {
      return _.reduce(thisVal,function (memo, item, i) {
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // No need to worry about stripping undefined items.
        // ***(see note above about bidirectional-JSON-compatible-ness)***
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        var unescapedItem = _unescapeRecursive(item, i);
        memo.push(unescapedItem);
        return memo;
      }, []);
    }
    // Otherwise, this must be an "object".  And since we know it's
    // neither `null` nor an array, we can safely assume it is a dictionary.
    // ***(see note above about bidirectional-JSON-compatible-ness)***
    //
    // So we'll recursively unescape it.
    else {
      return _.reduce(_.keys(thisVal),function (memo, key) {
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // No need to worry about stripping keys with `undefined` values.
        // ***(see note above about bidirectional-JSON-compatible-ness)***
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        memo[key] = _unescapeRecursive(thisVal[key], key);
        return memo;
      }, {});
    }

    return thisVal;

  })(data, '');//</self-calling function :: _unescapeRecursive>

};
