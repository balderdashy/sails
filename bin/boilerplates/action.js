	// To trigger this action locally, visit: `http://localhost:port<%- baseurl %>/<%- action %>`
	<%- action %>: function (req,res) {

		// This will render the view: <%- viewPath %>/<%-entity%>/<%- action %>.<%- viewEngine %>
		res.view();

	}