/**
*
* Only allow users with the roleName role.
*
* Usage:
*
*  ...
*
*  someAction: policy.only('roleName')
*
*  ...
*/
module.exports = function(roleName) {
	return function (req,res,ok) {

		// Check if this Account has the specified role

		// TODO: Your role-checking logic here
		// Account.hasRole(req.session.account,roleName,ok, function () {
			// res.send(403);
		// });

		// Always deny access for now:
		res.send(403);
	};
};