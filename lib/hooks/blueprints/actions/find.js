/**
 * Module dependencies
 */
var util = require('util');



/**
 * Find Records
 * 
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to look up
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 *
 * @param {String} _jsonpCallbackParam - optional override for JSONP callback param (can be overridden in req.options.requestTimeOverrideForJsonpCallbackParam)
 * @param {String} callback - default jsonp callback param
 */

module.exports = function find (req, res) {
	// Ensure a model can be deduced from the request options.
	var model = req.options.model || req.options.controller;
	var associations = req.options.associations;

	var jsonp = req.options.jsonp;
	if (!model) return res.badRequest(util.format('No "model" specified in route options.'));

	// Get access to `sails` (globals might be disabled) and look up the model.
	var sails = req._sails;
	var Model = sails.models[model];
	
	if ( !Model ) return res.notFound(util.format('Invalid route option, "model".\nI don\'t know about any models named: `%s`',model));

	// if `req.isSocket` and JSONP is enabled for this action, we'll say of this request:
	// "isJSONPCompatibleAndEnabled"
	var isJSONPCompatibleAndEnabled = req.options.jsonp && !req.isSocket;
	
	
	if (isJSONPCompatibleAndEnabled){
		
		
		// Whether request-time overrides are allowed for the jsonp callback name
		// (defaults to '_jsonpCallbackParam')
		var requestTimeOverrideForJsonpCallbackParam = 
			typeof req.options.requestTimeOverrideForJsonpCallbackParam === 'undefined' ?
			'_jsonpCallbackParam' :
			req.options.requestTimeOverrideForJsonpCallbackParam;
		
		// Enforce/apply request-time jsonp callback override setting
		if (!requestTimeOverrideForJsonpCallbackParam &&
				req.param(requestTimeOverrideForJsonpCallbackParam) && 
				!allowRuntimeJsonpCallbackOverride) {
			return res.forbidden('JSONP callback configuration not allowed.');
		}

		// The name of the parameter to use for JSONP callbacks
		// Callback param can come from the params (if allowed above), `req.options`, or defaults to `callback`
		var jsonpCallbackParam = req.param(requestTimeOverrideForJsonpCallbackParam) || req.options.jsonpCallbackParam || 'callback';
		var originalJsonpCallbackParam = req.app.get('jsonp callback name');
		req.app.set('jsonp callback name', jsonpCallbackParam);
	}

	var Q;


	/**
	 * If a valid id was specified, find the particular instance with that id.
	 */
	if (req.param('id')) {
		Q = Model.findOne(req.param('id'));
		Q = _(associations).reduce(function (Q, association) {
			return Q.populate(association.alias /*, { limit: 30 } */);
		}, Q);
		Q.exec(function found(err, matchingRecord) {

			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			// No model instance found with the specified id
			if(!matchingRecord) return res.notFound();

			// Use the model class's subscribe method to subscribe to all blueprint notifications 
			// about this instance IF pubsub is enabled AND this is a socket request AND
			// autosubscribe is enabled for the model class.
			if (sails.hooks.pubsub && req.isSocket && Model.autosubscribe) {
				Model.subscribe(req, matchingRecord);
			}

			// Otherwise serve a JSON(P) API
			if ( isJSONPCompatibleAndEnabled ) {
				return res.jsonp(matchingRecord);
			}
			else {
				return res.json(matchingRecord);
			}
		});
	}


	/**
	 * If no id was specified, find instances matching the specified criteria.
	 */
	else {		

		// TODO: customize this logic
		// (i.e. if req.options.limit is set, it's likely a ceiling, and while overridable,
		//  the `?limit=...` param probably shouldn't be allowed to exceed the configured limit in route options / policies)

		var where = _.merge({}, req.options.where || {}, parseWhereParam(req.params.all())) || undefined;
		var limit = req.param('limit') || (typeof req.options.limit !== 'undefined' ? req.options.limit : undefined);
		if (limit) { limit = +limit; }
		var skip = req.param('skip') || (typeof req.options.skip !== 'undefined' ? req.options.skip : undefined);
		if (skip) { skip = +skip; }

		// Lookup for records that match the specified criteria
		Q = Model.find({
			limit: limit,
			skip: skip,
			sort: req.param('sort') || req.options.sort || undefined,
			where: where
		});
		Q = _(associations).reduce(function (Q, association) {
			return Q.populate(association.alias /*,  { limit: 30 } */);
		}, Q);

		Q.exec(function found(err, matchingRecords) {

			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			// No instances found
			if(!matchingRecords) return res.notFound();

			// Use the model class's subscribe method to subscribe to all blueprint notifications 
			// about these instances IF pubsub is enabled AND this is a socket request AND
			// autosubscribe is enabled for the model class.
			if (sails.hooks.pubsub && req.isSocket && Model.autosubscribe) {
				Model.subscribe(req, matchingRecords);
			}

			// Otherwise serve a JSON(P) API
			if ( isJSONPCompatibleAndEnabled ) {
				return res.jsonp(matchingRecords);
			}
			else {
				return res.json(matchingRecords);
			}
		});
	}







	// TODO:
	// 
	// Replace the following helper with the version in sails.util:

	// Attempt to parse JSON
	// If the parse fails, return the error object
	// If JSON is falsey, return null
	// (this is so that it will be ignored if not specified)
	function tryToParseJSON (json) {
		if (!sails.util.isString(json)) return null;
		try {
			return JSON.parse(json);
		}
		catch (e) {
			return e;
		}
	}

	/**
	 * parseWhereParam
	 * 
	 * @param  {Object} allParams [result of calling req.params.all()]
	 * @return {Object}           the WHERE criteria object
	 */
	function parseWhereParam( allParams ) {

		var where = req.param('where');

		// If `where` parameter is a string, try to interpret it as JSON
		if (sails.util.isString(where)) {
			where = tryToParseJSON(where);
		}

		// If `where` has not been specified, but other unbound parameter variables
		// **ARE** specified, build the `where` option using them.
		if (!where) {
			// Prune params which aren't fit to be used as `where` criteria
			// to build a proper where query
			where = allParams;
			where = sails.util.omit(where, ['limit', 'skip', 'sort']);
			where = sails.util.omit(where, function (p){ if (sails.util.isUndefined(p)) return true; });
			if (isJSONPCompatibleAndEnabled) {
				where = sails.util.omit(where, [jsonpCallbackParam]);
				if (requestTimeOverrideForJsonpCallbackParam) {
					where = sails.util.omit(where, [requestTimeOverrideForJsonpCallbackParam]);
				}
			}
			// console.log(requestTimeOverrideForJsonpCallbackParam);
			// console.log(isJSONPCompatibleAndEnabled, jsonpCallbackParam, 'hi');
			// console.log(req.params.all(), '***\n', where);
		}

		return where;
	}

};

