module.exports = function(sails){

  var i18n = sails.config.blueprints.i18n;

  if(i18n){
    var langs = sails.config.i18n.locales;
    langs.forEach(function (lang, i) {
     langs[i] = '/' + lang + '/';
    });
    langs.splice(0,0, '/');
    return langs;
  }

  return '/';

};
