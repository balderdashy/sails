/**
 * Stubble JS
 * a trimmed down moustache.js
 * (c) 2011 Michael McNeil
 *
 * Stubble.js is freely distributable under the terms of the MIT license.
 */
$.stubble = function (template, valueMap) {
    var result = template;
    for (var key in valueMap) {
        var re = new RegExp("\{\{"+_.escape(key)+"\}\}","g");
        result = result.replace(re,_.escape(valueMap[key]));
    }
    return result;
}