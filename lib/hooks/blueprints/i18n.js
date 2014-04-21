 /**
  * Return array of langs url path
  *
  * values:
  *   - detect: the lang is set by accept-language header.
  *
  *     see more: https://www.w3.org/International/questions/qa-accept-lang-locales
  *     the request is redirect automatically. Example:
  *     /user/ (and detect EN lang) -> redirect to -> /en/user
  *
  *   - url: the lang is set by url. Example:
  *
  *     /en/user/
  *     /fr/use/
  *     ....
  *
  *     based on user preferences
  *
  *   - false: desactivate lang support.
  */
module.exports = function(sails){

  var option = sails.config.blueprints.i18n.toString();


  if (option === 'url' || option === 'detect'){
    var langs = sails.config.i18n.locales;
    langs.forEach(function (lang, i) {
     langs[i] = '/' + lang + '/';
    });
    return langs;
  }

  return '/';

};
