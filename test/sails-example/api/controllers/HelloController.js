/*---------------------
	:: Hello 
	-> controller
---------------------*/
var HelloController = {

	// To trigger this action locally, visit: `http://localhost:port/hello/index`
	index: function (req,res) {

		// This will render the view: ./ui/views/hello/index.ejs
		res.view();

	}

};
module.exports = HelloController;