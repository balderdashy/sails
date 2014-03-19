// from find.js:
// 
// 
// 
// 
	// ***************************************************************
	// `runtimeOverrideForJsonpCallbackParam` is disabled for now.
	// (will be pulled into a separate hook and configurable for
	//  ALL requests, not just blueprints, in an upcoming release.)
	// ***************************************************************
 
  // * @param {String} _jsonpCallbackParam - optional override for JSONP callback param (can be overridden in req.options.requestTimeOverrideForJsonpCallbackParam)
	// if (isJSONPCompatibleAndEnabled){

	// var jsonp = req.options.jsonp;
	// 	// Whether request-time overrides are allowed for the jsonp callback name
	// 	// (defaults to '_jsonpCallbackParam')
	// 	var requestTimeOverrideForJsonpCallbackParam =
	// 		typeof req.options.requestTimeOverrideForJsonpCallbackParam === 'undefined' ?
	// 			'_jsonpCallbackParam' :
	// 			req.options.requestTimeOverrideForJsonpCallbackParam;


	// 	// Enforce/apply request-time jsonp callback override setting
	// 	if (!requestTimeOverrideForJsonpCallbackParam &&
	// 		req.param(requestTimeOverrideForJsonpCallbackParam) &&
	// 		! (typeof req.options.jsonp === 'object' && req.options.jsonp.allowOverride) ) {
	// 		return res.forbidden('JSONP callback configuration not allowed.');
	// 	}

	// 	// The name of the parameter to use for JSONP callbacks
	// 	// Callback param can come from the params (if allowed above), `req.options`, or defaults to `callback`
	// 	var jsonpCallbackParam = req.param(requestTimeOverrideForJsonpCallbackParam) || req.options.jsonpCallbackParam || 'callback';
	// 	var originalJsonpCallbackParam = req.app.get('jsonp callback name');
	// 	req.app.set('jsonp callback name', jsonpCallbackParam);
	// }





// from actionUtil.js (parseCriteria):
//
//
//
	// ***************************************************************
	// `runtimeOverrideForJsonpCallbackParam` is disabled for now.
	// (will be pulled into a separate hook and configurable for
	//  ALL requests, not just blueprints, in an upcoming release.)
	// ***************************************************************
	// 
	// 	if (req.options.jsonp.runtime) {
	// 		where = _.omit(where, [runtimeOverrideForJsonpCallbackParam]);
	// 	}
	// }
	


	// console.log(requestTimeOverrideForJsonpCallbackParam);
	// console.log(isJSONPCompatibleAndEnabled, jsonpCallbackParam, 'hi');
	// console.log(req.params.all(), '***\n', where);