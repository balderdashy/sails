module.exports = {

  watch: function(req, res) {
    req._sails.models.pet.watch(req);
    res.send(200);
  }

};
