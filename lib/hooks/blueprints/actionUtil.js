/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var mergeDefaults = require('merge-defaults');// « TODO: Get rid of this

/**
 * Utility methods used in built-in blueprint actions.
 *
 * @type {Object}
 */
var actionUtil = {

  /**
   * Given a Waterline query and an express request, populate
   * the appropriate/specified association attributes and
   * return it so it can be chained further ( i.e. so you can
   * .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Request} req
   * @return {Query}
   */
  populateRequest: function(query, req) {
    var DEFAULT_POPULATE_LIMIT = req._sails.config.blueprints.defaultLimit || 30;
    var _options = req.options;
    var aliasFilter = req.param('populate');
    var shouldPopulate = _.isUndefined(_options.populate) ? (req._sails.config.blueprints.populate) : _options.populate;

    // Convert the string representation of the filter list to an Array. We
    // need this to provide flexibility in the request param. This way both
    // list string representations are supported:
    //   /model?populate=alias1,alias2,alias3
    //   /model?populate=[alias1,alias2,alias3]
    if (typeof aliasFilter === 'string') {
      aliasFilter = aliasFilter.replace(/\[|\]/g, '');
      aliasFilter = (aliasFilter) ? aliasFilter.split(',') : [];
    }

    var associations = [];

    _.each(_options.associations, function(association) {
      // If an alias filter was provided, override the blueprint config.
      if (aliasFilter) {
        shouldPopulate = _.contains(aliasFilter, association.alias);
      }

      // Only populate associations if a population filter has been supplied
      // with the request or if `populate` is set within the blueprint config.
      // Population filters will override any value stored in the config.
      //
      // Additionally, allow an object to be specified, where the key is the
      // name of the association attribute, and value is true/false
      // (true to populate, false to not)
      if (shouldPopulate) {
        var populationLimit =
          _options['populate_' + association.alias + '_limit'] ||
          _options.populate_limit ||
          _options.limit ||
          DEFAULT_POPULATE_LIMIT;

        associations.push({
          alias: association.alias,
          limit: populationLimit
        });
      }
    });

    return actionUtil.populateQuery(query, associations, req._sails);
  },

  /**
   * Given a Waterline query and Waterline model, populate the
   * appropriate/specified association attributes and return it
   * so it can be chained further ( i.e. so you can .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Model} model         [waterline model object]
   * @return {Query}
   */
  populateModel: function(query, model) {
    return actionUtil.populateQuery(query, model.associations);
  },


  /**
   * Given a Waterline query, populate the appropriate/specified
   * association attributes and return it so it can be chained
   * further ( i.e. so you can .exec() it )
   *
   * @param  {Query} query         [waterline query object]
   * @param  {Array} associations  [array of objects with an alias
   *                                and (optional) limit key]
   * @return {Query}
   */
  populateQuery: function(query, associations, sails) {
    var DEFAULT_POPULATE_LIMIT = (sails && sails.config.blueprints.defaultLimit) || 30;

    return _.reduce(associations, function(query, association) {
      var options = {};
      if (association.type === 'collection') {
        options.limit = association.limit || DEFAULT_POPULATE_LIMIT;
      }
      return query.populate(association.alias, options);
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
      var AssociatedModel = req._sails.models[ident];

      if (req.options.autoWatch) {
        AssociatedModel._watch(req);
      }

      // Subscribe to each associated model instance in a collection
      if (assoc.type === 'collection') {
        _.each(record[assoc.alias], function (associatedInstance) {
          AssociatedModel.subscribe(req, [associatedInstance[AssociatedModel.primaryKey]]);
        });
      }
      // If there is an associated to-one model instance, subscribe to it
      else if (assoc.type === 'model' && _.isObject(record[assoc.alias])) {
        AssociatedModel.subscribe(req, [record[assoc.alias][AssociatedModel.primaryKey]]);
      }
    });
  },


  /**
   * Parse primary key value for use in a Waterline criteria
   * (e.g. for `find`, `update`, or `destroy`)
   *
   * @param  {Request} req
   * @return {Integer|String}
   */
  parsePk: function ( req ) {

    var pk = req.options.id || (req.options.where && req.options.where.id) || req.param('id');

    // FUTURE: make this smarter...
    // (e.g. look for actual primary key of model and look for it
    //  in the absence of `id`.)

    // exclude criteria on id field
    pk = _.isPlainObject(pk) ? undefined : pk;
    return pk;
  },



  /**
   * Parse primary key value from parameters.
   * Throw an error if it cannot be retrieved.
   *
   * @param  {Request} req
   * @return {Integer|String}
   */
  requirePk: function (req) {
    var pk = module.exports.parsePk(req);

    // Validate the required `id` parameter
    if ( !pk ) {

      var err = new Error(
      'No `id` parameter provided.'+
      '(Note: even if the model\'s primary key is not named `id`- '+
      '`id` should be used as the name of the parameter- it will be '+
      'mapped to the proper primary key name)'
      );
      err.status = 400;
      throw err;
    }

    return pk;
  },



  /**
   * Parse `criteria` for a Waterline `find` or `update` from all
   * request parameters.
   *
   * @param  {Request} req
   *
   * @returns {Dictionary}
   *          The normalized WHERE clause
   *
   * @throws {Error} If WHERE clause cannot be parsed...
   *                 ...whether that's for syntactic reasons (JSON.parse),
   *                 or for semantic reasons (Waterline's `forgeStageTwoQuery()`).
   *         @property {String} `name: 'UsageError'`
   */
  parseCriteria: function ( req ) {

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: this should be renamed to `.parseWhere()`
    // ("criteria" means the entire dictionary, including
    // `where` -- but also `skip`, `limit`, etc.)
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Allow customizable blacklist for params NOT to include as criteria.
    req.options.criteria = req.options.criteria || {};
    req.options.criteria.blacklist = req.options.criteria.blacklist || ['limit', 'skip', 'sort', 'populate'];

    // Validate blacklist to provide a more helpful error msg.
    var blacklist = req.options.criteria && req.options.criteria.blacklist;
    if (blacklist && !_.isArray(blacklist)) {
      throw new Error('Invalid `req.options.criteria.blacklist`. Should be an array of strings (parameter names.)');
    }

    // Look for explicitly specified `where` parameter.
    var where = req.allParams().where;

    // If `where` parameter is a string, try to interpret it as JSON.
    // (If it cannot be parsed, throw a UsageError.)
    if (_.isString(where)) {
      try {
        where = JSON.parse(where);
      } catch (e) {
        throw flaverr({ name: 'UsageError' }, new Error('Could not JSON.parse() the provided `where` clause. Here is the raw error: '+e.stack));
      }
    }//>-•

    // If `where` has not been specified, but other unbound parameter variables
    // **ARE** specified, build the `where` option using them.
    if (!where) {

      // Prune params which aren't fit to be used as `where` criteria
      // to build a proper where query
      where = req.allParams();

      // Omit built-in runtime config (like query modifiers)
      where = _.omit(where, blacklist || ['limit', 'skip', 'sort']);

      // Omit any params that have `undefined` on the RHS.
      where = _.omit(where, function(p) {
        if (_.isUndefined(p)) { return true; }
      });

    }//>-

    // Deep merge w/ req.options.where.
    where = _.merge({}, req.options.where || {}, where) || undefined;

    // Return final `where`.
    return where;
  },


  /**
   * Parse `values` for a Waterline `create` or `update` from all
   * request parameters.
   *
   * @param  {Request} req
   * @return {Dictionary}
   */
  parseValues: function (req) {

    // Allow customizable blacklist for params NOT to include as values.
    req.options.values = req.options.values || {};
    req.options.values.blacklist = req.options.values.blacklist;

    // Validate blacklist to provide a more helpful error msg.
    var blacklist = req.options.values.blacklist;
    if (blacklist && !_.isArray(blacklist)) {
      throw new Error('Invalid `req.options.values.blacklist`. Should be an array of strings (parameter names.)');
    }

    // Start an array to hold values
    var values;

    // Make an array out of the request body data if it wasn't one already;
    // this allows us to process multiple entities (e.g. for use with a "create" blueprint) the same way
    // that we process singular entities.
    var bodyData = _.isArray(req.body) ? req.body : [req.allParams()];

    // Process each item in the bodyData array, merging with req.options, omitting blacklisted properties, etc.
    var valuesArray = _.map(bodyData, function(element){
      var values;
      // Merge properties of the element into req.options.value, omitting the blacklist
      values = mergeDefaults(element, _.omit(req.options.values, 'blacklist'));
      // Omit properties that are in the blacklist (like query modifiers)
      values = _.omit(values, blacklist || []);
      // Omit any properties w/ undefined values
      values = _.omit(values, function(p) {
        if (_.isUndefined(p)) {
          return true;
        }
      });

      return values;
    });

    // If req.body is an array, simply return our array of processed values
    if (_.isArray(req.body)) {return valuesArray;}

    // Otherwaise grab the first (and only) value from valuesArray
    values = valuesArray[0];

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
    if (!model) { throw new Error(util.format('No "model" specified in route options.')); }

    var Model = req._sails.models[model];
    if ( !Model ) { throw new Error(util.format('Invalid route option, "model".\nI don\'t know about any models named: `%s`',model)); }

    return Model;
  },



  /**
   * @param  {Request} req
   */
  parseSort: function (req) {
    var sort = req.param('sort') || req.options.sort;
    if (_.isUndefined(sort)) {return undefined;}

    // If `sort` is a string, attempt to JSON.parse() it.
    // (e.g. `{"name": 1}`)
    if (_.isString(sort)) {
      try {
        sort = JSON.parse(sort);
        // If it is not valid JSON (e.g. because it's just some other string),
        // then just fall back to interpreting it as-is (e.g. "name ASC")
      } catch(unusedErr) {}
    }
    return sort;
  },

  /**
   * @param  {Request} req
   */
  parseLimit: function (req) {
    var DEFAULT_LIMIT = req._sails.config.blueprints.defaultLimit || 30;
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


module.exports = actionUtil;
