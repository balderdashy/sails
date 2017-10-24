module.exports = function(sails) {

  return {

    initialize: async function(cb) {

      var dumb = function() {
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            if (sails.config.custom && sails.config.custom.reject) {
              return reject('foo');
            }
            return resolve('foo')
          }, 100);
        });
      };
      this.val = await dumb();
      return cb();
    }

  };

};
