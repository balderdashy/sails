_          = require('lodash');

module.exports = function(sails){

  var i18n = sails.config.blueprints.i18n;

  if(i18n){
    var langs = sails.config.i18n.locales;

    _(langs).forEach(function (lang, i) {
     langs[i] = '/' + lang + '/';
    });

    // TODO: At this moment, added '/' for
    // get res object from get / petition to redirect /:lang/user
    langs.splice(0,0, '/');
    return langs;
  }

  return '/';

};
