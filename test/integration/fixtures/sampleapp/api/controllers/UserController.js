module.exports = {

  watch: function(req, res) {
    User.watch(req);
    res.send(200);
  },

  message: function(req, res) {
    User.findOne({
      user_id: 1
    }, function(err, user) {
      if (err) return res.json(500, {
        error: err
      });
      else if (!user) {
        return res.json(404,{
          error: 'Expected specified user (with user_id=1) to exist...'
        });
      } else {
        User.message(user, {
          greeting: 'hello'
        }, req);
        return res.send(200);
      }
    });
  },

  subscribe: function(req, res) {

    User.subscribe(req, {
      user_id: req.param('id')
    }, req.param('context'));
    res.send(200);
  }


};
