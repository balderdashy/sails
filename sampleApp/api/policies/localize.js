/**
 * Middleware for redirect access to lang api support
 */
 module.exports = function(req, res, next) {

  var i18n = sails.config.blueprints.i18n;
  if (i18n){

    var model = req.options.model;
    var path  = req.path.split('/');

    if (model === path[1]){
      var url = req.baseUrl + req.locale + req.path;
      res.redirect(url);
    }
  }
  next();
};
