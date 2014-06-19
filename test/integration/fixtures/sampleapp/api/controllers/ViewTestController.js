module.exports = {

	index: function(req, res, next) {
		res.view();
	},

	create: function(req, res, next) {
		res.view();
	},

  	viewOptions: function(req, res, next) {
    	res.view();
  	},

  	viewOptionsOverride: function(req, res, next) {
    	res.view('viewtest/viewOptions', {foo:'!baz!'});
  	},

  	csrf: function(req, res, next) {
  		res.view();
  	}

};
