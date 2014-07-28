_          = require('lodash');

module.exports = {


  /**
   * Check is blueprint.i18n status
   * @param  {Object} sails
   * @return {array}       Url langs path
   */
  'getLangs' : function(sails){

    var i18n = sails.config.blueprints.i18n,
    langs;

    if(i18n){
      langs = sails.config.i18n.locales;

      _(langs).forEach(function (lang, i) {
       langs[i] = '/' + lang + '/';
     });

      // if isn't added default route isn't possible
      // to fix later
      langs.splice(0,0, '/');
      return langs;
    }

    return '/';
  },


  /**
   * Check if url can be fix with lang support
   * @param  {Object} sails
   * @return {type}   true it is possible, false in other case
   */
  'isFixUrl' : function(req){

    var i18n = sails.config.blueprints.i18n;

    if (i18n){
      var model = req.options.model;
      var path  = req.path.split('/');

      if (model === path[1]){
        return true;
      }
    }

    return false;
  },


  /**
   * Fix url path with aproppiate lang support
   * @param  {Object}         sails
   * @return {string}         new absolute url
   */
  'fixUrl' : function(req){
    // console.log(req.url + ' is fixed to '+ '/' + req.locale + req.url); // debug
    req.url = '/' + req.locale + req.url;
  }

};
