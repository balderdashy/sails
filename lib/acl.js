// Determine route plan for incoming requests based on policies
exports.enforce = function(controllerName, actionName, req, res, next) {

	// The routing directions
	var routePlan;

	// Traverse access control tree to determine where to route this request
	var controller = sails.acl[controllerName];
	if(controller && (!_.isUndefined(controller[actionName]) || !_.isUndefined(controller['*']))) {
		var action = controller[actionName];
		if(!_.isUndefined(action)) {
			// If a function was specified, run it as the policy middleware
			if (_.isFunction(action)) {
				routePlan = action;
			}
			// If an object was specified, use the policy key
			else if (_.isObject(action)) {

				routePlan = action.policy;
				
				// TODO: support parameter validation
			}
			// If true was specified, always allow
			else if (action === true) {
				routePlan = function (req,res,next) { next(); };
			}
			// If false was specified, always deny
			else if (action === false) {
				routePlan = function (req,res,next) { res.send(403); };
			}
			else {
				throw new Error ("Invalid entry in access_control.js! Controller: "+controllerName+"\nAction: "+actionName);
			}
			
		} else {
			// Use controller default
			routePlan = controller['*'];
		}
	} else {
		// Use app default
		routePlan = !_.isUndefined(sails.acl['*']) ? sails.acl['*'] : true;
	}

	// Route or reroute if necessary
	reroute(routePlan, req, res, next);
};


// Reroute as a result of access control
function reroute(routePlan, req, res, next) {
	// If routePlan is boolean, allow or deny from all accordingly
	if(routePlan === true) {
		next();
	}
	// Prevent redirect loops by always setting access to '/403' to true
	else if (req.url === '/403') {
		next();
	} 
	// if the routePlan is a function, treat it as basic middleware
	else if(_.isFunction(routePlan)) { 
		routePlan(req, res, next);
	}
}