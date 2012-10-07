// Default access permissions
var permissions = function() {
	return {
		"*": true
	};
};

// Extend permissions from main file
permissions = _.extend(permissions, config.permissions || {});

// Extend permissions from config directory (legacy method)
if(path.existsSync(config.appPath + '/config/permissions.js')) {
	permissions = _.extend(permissions, require(config.appPath + '/config/permissions').accessControlTree());
}

// Route incoming requests based on credentials

exports.verify = function (controllerName, actionName, req, res, next) {

	// The routing directions
	var routePlan;

	// Traverse access control tree to determine where to route this request
	var controller = permissions[controllerName];
	if(controller && (!_.isUndefined(controller[actionName]) || !_.isUndefined(controller['*']))) {
		var action = controller[actionName];
		if(!_.isUndefined(action)) {

			// Use action route plan
			routePlan = action;
		} else {
			// Use controller default
			routePlan = controller['*'];
		}
	} else {
		// Use app default
		routePlan = !_.isUndefined(permissions['*']) ? permissions['*'] : true;
	}

	// Rereoute if necessary (exit middleware)
	reroute(routePlan, req, res, next);
}


// Reroute as a result of access control

function reroute(routePlan, req, res, next) {
	// If routePlan is boolean, allow or deny from all accordingly
	if(routePlan === true) {
		next();
	}
	// Prevent redirect loops by always setting access to '/403' to true
	else if(req.url === '/403') {
		next();
	} else if(routePlan === false) {
		res.render('403', {
			title: 'Access Denied'
		});
	}
	// if the routePlan is a function, treat it as basic middleware
	else if(_.isFunction(routePlan)) {
		routePlan(req, res, next);
	}

	// TODO: Role-aware route plans ("user", "admin", ["user","editor"], etc.)
	// TODO: complex condition routePlan objects
}