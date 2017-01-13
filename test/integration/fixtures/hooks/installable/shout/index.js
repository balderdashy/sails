module.exports = function(sails) {

  var phrase;
  return {

    defaults: {
      __configKey__: {
        phrase: 'make it rain'
      }
    },

    initialize: function(cb) {
      phrase = sails.config[this.configKey].phrase;
      this.isShoutyHook = true;
      cb();
    },

    routes: {
      before: {
        'GET /shout': function(req, res, next) {
          res.send(phrase);
        }
      }
    }

  };

};
