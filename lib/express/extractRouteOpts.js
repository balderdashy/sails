// TODO: re-enable per-route options in a more global way for other configuration

// var limitDefault = sails.config.fileUpload.maxMB;
// 		var needToCheckRoutes = false;

		// pre-calculare regexp for paths
		// for (var key in sails.config.routes) {
		// 	var match = expressUtils.pathRegexp(key.split(' ').reverse()[0], []);
		// 	sails.config.routes[key].pathRegexp = match;

		// 	// Optimization: don't check routes if we don't need to
		// 	if(sails.config.routes[key].limit || sails.config.routes[key].streamFiles) {
		// 		needToCheckRoutes = true;
		// 	}
		// }

		// Limit file uploads and set CORS per route
		// app.use(function(req, res, next) {
		// 	if(needToCheckRoutes) {
		// 		// Iterate over routes
		// 		for (var key in sails.config.routes) {
		// 			var route = sails.config.routes[key];
					
		// 			// Check if route matches the url we're trying to go to
		// 			if(route.pathRegexp.exec(req.url) &&
  //                      (key.split(' ').length > 1 ? req.method.toLowerCase() === key.split(' ')[0].toLowerCase() : true)) {
		// 				if (typeof route === 'object'){
							
		// 					if(route.streamFiles) {
		// 						var type = req.headers['content-type'];
		// 						if (type && type.toLowerCase().indexOf('multipart/form-data') !== -1) {
		// 							sails.log.verbose('Streaming files, disabling body parer for this request');
		// 							req.bodyParserDisabled = true;
		// 						}
		// 					}
							
		// 					// Apply uploadLimit config
		// 					if(route.uploadLimit) {
		// 						return express.limit(route.uploadLimit)(req, res, next);
		// 					}
		// 				}
					
		// 				return express.limit(limitDefault)(req, res, next);
		// 			}
		// 		}

		// 	}
			
		// 	return express.limit(limitDefault)(req, res, next);
		// });