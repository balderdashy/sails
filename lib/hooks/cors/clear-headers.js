module.exports = function (req, res, next) {

  // If we can set headers, do so.
  // (Note: This is for backwards-compatibility. `res.set()` should always exist now.
  //  This check can be removed in a future version of Sails- just needs tests first.)
  if (res.set) {
    res.set('Access-Control-Allow-Origin', '');
    res.set('Access-Control-Allow-Credentials', '');
    res.set('Access-Control-Allow-Methods', '');
    res.set('Access-Control-Allow-Headers', '');
    res.set('Access-Control-Expose-Headers', '');
  }

  next();

};
