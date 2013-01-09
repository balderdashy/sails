/*------------------------------------
	:: <%- entity %>.<%- action %> 
	-> federated controller action
------------------------------------*/

// To trigger this action locally, visit: `http://localhost:port<%- baseurl %>/<%- action %>`
function <%- action %> (req,res) {
	
	// This will render the view: <%- viewPath %>/<%-entity%>/<%- action %>.<%- viewEngine %>
	res.view();

};
module.exports = <%- action %>;