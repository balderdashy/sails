	// Default action for this controller
	// To trigger this action, visit: `http://<%- hostname %><%- port %><%- baseurl %>`
	// By default, if index() is removed, findAll() will be called instead
	index: function (req,res) {

		// This will render the view: <%- viewPath %>/<%-entity%>/<%- action %>.<%- viewEngine %>
		res.view();
	}