module.exports = {

  watch: function(req, res) {
    Pet.watch(req);
    res.send(200);
  }

};
