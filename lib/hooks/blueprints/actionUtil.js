/**
 * Module dependencies
 */

var _ = require('lodash'),
	util = require('util');


// Parameter used for jsonp callback is constant, as far as
// blueprints are concerned (for now.)
var JSONP_CALLBACK_PARAM = 'callback';


module.exports = {

	/**
	 * Given a Waterline query, populate the appropriate/specified
	 * association attributes and return it so it can be chained
	 * further ( i.e. so you can .exec() it )
	 *
	 * @param  {Query} query         [waterline query object]
	 * @param  {Object} options
	 * @return {Query}
	 */
	populateEach: function ( query, options ) {

		var DEFAULT_POPULATE_LIMIT = 30;

		return _(options.associations).reduce(function populateEachAssociation (query, association) {

			// Only populate associations if `populate` is set
			//
			// Additionally, allow an object to be specified, where the key is the name
			// of the association attribute, and value is true/false (true to populate,
			// false to not)
			if (options.populate){
				return query.populate(association.alias, { limit: DEFAULT_POPULATE_LIMIT });
			}
			else return query;
		}, query);
	},

	/**
	 * Subscribe deep (associations)
	 *
	 * @param  {[type]} associations [description]
	 * @param  {[type]} record       [description]
	 * @return {[type]}              [description]
	 */
	subscribeDeep: function ( req, record ) {
		_.each(req.options.associations, function (assoc) {

			// Look up identity of associated model
			var ident = assoc[assoc.type];
			var AssociatedModel = sails.models[ident];

			if (req.options.autoWatch) {
				AssociatedModel.watch(req);
			}

			// Subscribe to each associated model instance
			if (assoc.type === 'collection') {
				_.each(record[assoc.alias], function (associatedInstance) {
					AssociatedModel.subscribe(req, associatedInstance);
				});
			}
			else if (assoc.type === 'model') {
				AssociatedModel.subscribe(req, record[assoc.alias]);
			}
		});
	},



	/**
	 * Parse `criteria` for a Waterline `find` or `update` from all
	 * request parameters.
	 *
	 * @param  {Request} req
	 * @return {Object}            the WHERE criteria object
	 */
	parseCriteria: function ( req ) {
		
		// Allow customizable blacklist for params NOT to include as criteria.
		req.options.criteria = req.options.criteria || {};
		req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort'];

		// Validate blacklist to provide a more helpful error msg.
		var blacklist = req.options.criteria && req.options.criteria.blacklist;
		if (blacklist && !_.isArray(blacklist)) {
			throw new Error('Invalid `req.options.criteria.blacklist`. Should be an array of strings (parameter names.)');
		}

		// Look for explicitly specified `where` parameter.
		var where = req.params.all().where;

		// If `where` parameter is a string, try to interpret it as JSON
		if (_.isString(where)) {
			where = tryToParseJSON(where);
		}

		// If `where` has not been specified, but other unbound parameter variables
		// **ARE** specified, build the `where` option using them.
		if (!where) {

			// Prune params which aren't fit to be used as `where` criteria
			// to build a proper where query
			where = req.params.all();
			
			// Omit built-in runtime config (like query modifiers)
			where = _.omit(where, blacklist || ['limit', 'skip', 'sort']);

			// Omit any params w/ undefined values
			where = _.omit(where, function (p){ if (_.isUndefined(p)) return true; });

			// Omit jsonp callback param (but only if jsonp is enabled)
			var jsonpOpts = req.options.jsonp && !req.isSocket;
			jsonpOpts = _.isObject(jsonpOpts) ? jsonpOpts : { callback: JSONP_CALLBACK_PARAM };
			if (jsonpOpts) {
				where = _.omit(where, [jsonpOpts.callback]);
			}
		}

		// Merge w/ req.options.where and return
		where = _.merge({}, req.options.where || {}, where) || undefined;

		return where;
	},


	/**
	 * Parse `values` for a Waterline `create` or `update` from all
	 * request parameters.
	 * 
	 * @param  {Request} req
	 * @return {Object}
	 */
	parseValues: function (req) {

		// Allow customizable blacklist for params NOT to include as values.
		req.options.values = req.options.values || {};
		req.options.values.blacklist = req.options.values.blacklist;

		// Validate blacklist to provide a more helpful error msg.
		var blacklist = req.options.values.blacklist;
		if (blacklist && !_.isArray(blacklist)) {
			throw new Error('Invalid `req.options.criteria.blacklist`. Should be an array of strings (parameter names.)');
		}

		// Prune params which aren't fit to be used as `values`
		values = req.params.all();
		
		// Omit built-in runtime config (like query modifiers)
		values = _.omit(values, blacklist || []);

		// Omit any params w/ undefined values
		values = _.omit(values, function (p){ if (_.isUndefined(p)) return true; });

		// Omit jsonp callback param (but only if jsonp is enabled)
		var jsonpOpts = req.options.jsonp && !req.isSocket;
		jsonpOpts = _.isObject(jsonpOpts) ? jsonpOpts : { callback: JSONP_CALLBACK_PARAM };
		if (jsonpOpts) {
			values = _.omit(values, [jsonpOpts.callback]);
		}

		return values;
	},



	/**
	 * Determine the model class to use w/ this blueprint action.
	 * @param  {Request} req
	 * @return {WLCollection}
	 */
	parseModel: function (req) {

		// Ensure a model can be deduced from the request options.
		var model = req.options.model || req.options.controller;
		if (!model) throw new Error(util.format('No "model" specified in route options.'));

		var Model = req._sails.models[model];
		if ( !Model ) throw new Error(util.format('Invalid route option, "model".\nI don\'t know about any models named: `%s`',model));

		return Model;
	},



	/**
	 * @param  {Request} req
	 */
	parseSort: function (req) {
		return req.param('sort') || req.options.sort || undefined;
	},

	/**
	 * @param  {Request} req
	 */
	parseLimit: function (req) {
		var DEFAULT_LIMIT = 30;
		var limit = req.param('limit') || (typeof req.options.limit !== 'undefined' ? req.options.limit : DEFAULT_LIMIT);
		if (limit) { limit = +limit; }
		return limit;
	},


	/**
	 * @param  {Request} req
	 */
	parseSkip: function (req) {
		var DEFAULT_SKIP = 0;
		var skip = req.param('skip') || (typeof req.options.skip !== 'undefined' ? req.options.skip : DEFAULT_SKIP);
		if (skip) { skip = +skip; }
		return skip;
	}
};






// TODO:
//
// Replace the following helper with the version in sails.util:

// Attempt to parse JSON
// If the parse fails, return the error object
// If JSON is falsey, return null
// (this is so that it will be ignored if not specified)
function tryToParseJSON (json) {
	if (!_.isString(json)) return null;
	try {
		return JSON.parse(json);
	}
	catch (e) { return e; }
}