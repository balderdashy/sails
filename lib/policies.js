// Export runPolicy behavior
module.exports = runPolicy;

// Determine route plan for incoming requests based on policy
function runPolicy(controllerName, actionName, req, res, next) {

	// The routing directions
	var routePlan;

	// Traverse policy tree to determine where to route this request
	var controller = sails.config.policies[controllerName];
	if(controller && (!_.isUndefined(controller[actionName]))) {
		var action = controller[actionName];
		if(!_.isUndefined(action)) {
			// If a function was specified, run it as the policy middleware
			if(_.isFunction(action) || _.isArray(action)) {
				routePlan = action;
			}
			// If an object was specified, use the policy key
			else if(_.isObject(action)) {
				routePlan = action.policy;
			}
			// If true was specified, always allow
			else if(action === true) {
				routePlan = function(req, res, next) {
					next();
				};
			}
			// If false was specified, always deny
			else if(action === false) {
				routePlan = function(req, res, next) {
					res.send(403);
				};
			}
			// Look up proper policy by name
			else if (_.isString(action)) {
				routePlan = action;
			}
			// Unknown policy
			else {
				var message = "Invalid entry ("+action+") in policy configuration! Controller: " + controllerName + "\nAction: " + actionName;
				sails.log.error(action,"::",message);
				return res.send(message, 500);
			}

		} else {
			// Use controller default
			routePlan = controller['*'];
		}
	} else {
		// Use app default
		routePlan = !_.isUndefined(sails.config.policies['*']) ? sails.config.policies['*'] : true;
	}

	// Route or reroute if necessary
	reroute(routePlan, req, res, next);
}


// Reroute as a result of access control
function reroute(routePlan, req, res, next) {
	if (!_.isArray(routePlan)) {
		doReroute(routePlan, req, res, next);
	}
	// this is a array
	else {
		// append real filter at the end, then
		// delegate to filterChain pattern
		// routePlan.push(function () {
		// 	next();
		// });
		doReroute(routePlan,req,res,function () { next(); });
	}

}

function doReroute(routePlan, req, res, next) {
	// If routePlan is boolean, allow or deny from all accordingly
	if(routePlan === true) {
		next();
	}
	// if the routePlan is a function, treat it as basic policy middleware
	else if(_.isFunction(routePlan)) {
		routePlan(req, res, next);
	}
	// If a string was specified, lookup the appropriate policy
	else if (_.isString(routePlan)) {
		var plan = sails.policies[routePlan.toLowerCase()];
		if (plan) plan(req,res,next);
		else throw new Error('Trying to use unknown policy ('+routePlan+').  Please check your configuration in policies.js, and make sure any string policies you specify have a matching file in /api/policies.');
	}
	// Support multiple policies applied in a list
	else if (_.isArray(routePlan)) {
		// last in line, execute next
		if (!routePlan.length) {
			next();
		}
		// call actual filter with next one as callback
		else {
			doReroute(_.rest(routePlan,1), req, res, _.bind(doReroute, this, _.first(routePlan), req, res, next));
		}
	}
}
