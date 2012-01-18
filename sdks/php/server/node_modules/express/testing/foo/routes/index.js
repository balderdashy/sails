
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.writeHead(200);
  req.doesnotexist();
  // res.render('index', { title: 'Express' })
};