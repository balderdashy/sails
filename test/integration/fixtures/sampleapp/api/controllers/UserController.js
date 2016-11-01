module.exports = {

  watch: function(req, res) {
    req._sails.models.user.watch(req);
    res.send(200);
  },

  message: function(req, res) {
    req._sails.models.user.findOne({
      user_id: 1
    }, function(err, user) {
      if (err) {
        return res.json(500, {
          error: err
        });
      }
      else if (!user) {
        return res.json(404,{
          error: 'Expected specified user (with user_id=1) to exist...'
        });
      } else {
        req._sails.models.user.publish([user.user_id], {
          greeting: 'hello'
        }, req);
        return res.send(200);
      }
    });
  },

  subscribe: function(req, res) {

    req._sails.models.user.subscribe(req, [req.param('id')]);
    res.send(200);
  }


};
