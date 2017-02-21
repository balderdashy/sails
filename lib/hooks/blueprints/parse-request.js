/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');

module.exports = function(blueprint, req) {

  // Set some defaults.
  var DEFAULT_LIMIT = req._sails.config.blueprints.defaultLimit || 30;
  var DEFAULT_SKIP = 0;
  var DEFAULT_POPULATE_LIMIT = req._sails.config.blueprints.defaultLimit || 30;

  //  ┌─┐┌─┐┬─┐┌─┐┌─┐  ┌┬┐┌─┐┌┬┐┌─┐┬
  //  ├─┘├─┤├┬┘└─┐├┤   ││││ │ ││├┤ │
  //  ┴  ┴ ┴┴└─└─┘└─┘  ┴ ┴└─┘─┴┘└─┘┴─┘

  // Get the model identity from req.options.model (set for shadow routes), or by pulling off
  // the part of the action identity before the / (e.g. 'user/find' => 'user').
  var model = req.options.model || (req.options.action && req.options.action.split('/')[0]);
  if (!model) { throw new Error(util.format('No "model" specified in route options.')); }

  // Get the model class.
  var Model = req._sails.models[model];
  if ( !Model ) { throw new Error(util.format('Invalid route option, "model".\nI don\'t know about any models named: `%s`',model)); }

  //  ┌┬┐┌─┐┌─┐┌─┐┬ ┬┬ ┌┬┐  ┌─┐┌─┐┌─┐┬ ┬┬  ┌─┐┌┬┐┌─┐┌─┐
  //   ││├┤ ├┤ ├─┤│ ││  │   ├─┘│ │├─┘│ ││  ├─┤ │ ├┤ └─┐
  //  ─┴┘└─┘└  ┴ ┴└─┘┴─┘┴   ┴  └─┘┴  └─┘┴─┘┴ ┴ ┴ └─┘└─┘

  // Determine whether population is turned on for this route.
  var shouldPopulate = !_.isUndefined(req.options.populate) ? req.options.populate : req._sails.config.blueprints.populate;

  // Get the association attributes for this model.
  var associationAttributes = _.pluck(req.options.associations || [], 'alias');

  // Get the default populates array
  var defaultPopulates = !shouldPopulate ? {} : _.reduce(req.options.associations, function(memo, association) {
    if (association.type === 'collection') {
      memo[association.alias] = {
        where: {},
        limit: DEFAULT_POPULATE_LIMIT,
        skip: 0,
        sort: [ { id: 'ASC' } ],
        select: [ '*' ],
        omit: []
      };
    } else {
      memo[association.alias] = {};
    }
    return memo;
  }, {});

  // Initialize the queryOptions dictionary we'll be returning.
  var queryOptions = {
    using: model
  };

  switch (blueprint) {

    //  ███████╗██╗███╗   ██╗██████╗         ██╗
    //  ██╔════╝██║████╗  ██║██╔══██╗       ██╔╝
    //  █████╗  ██║██╔██╗ ██║██║  ██║      ██╔╝
    //  ██╔══╝  ██║██║╚██╗██║██║  ██║     ██╔╝
    //  ██║     ██║██║ ╚████║██████╔╝    ██╔╝
    //  ╚═╝     ╚═╝╚═╝  ╚═══╝╚═════╝     ╚═╝
    //
    //  ███████╗██╗███╗   ██╗██████╗  ██████╗ ███╗   ██╗███████╗
    //  ██╔════╝██║████╗  ██║██╔══██╗██╔═══██╗████╗  ██║██╔════╝
    //  █████╗  ██║██╔██╗ ██║██║  ██║██║   ██║██╔██╗ ██║█████╗
    //  ██╔══╝  ██║██║╚██╗██║██║  ██║██║   ██║██║╚██╗██║██╔══╝
    //  ██║     ██║██║ ╚████║██████╔╝╚██████╔╝██║ ╚████║███████╗
    //  ╚═╝     ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝

    case 'find':
    case 'findOne':

      queryOptions.criteria = {};

      //  ┌─┐┌─┐┬─┐┌─┐┌─┐  ╔═╗╦═╗╦╔╦╗╔═╗╦═╗╦╔═╗
      //  ├─┘├─┤├┬┘└─┐├┤   ║  ╠╦╝║ ║ ║╣ ╠╦╝║╠═╣
      //  ┴  ┴ ┴┴└─└─┘└─┘  ╚═╝╩╚═╩ ╩ ╚═╝╩╚═╩╩ ╩

      queryOptions.criteria.where = (function getWhereCriteria(){

        var where = {};

        // For `findOne`, set "where" to just look at the primary key.
        if (blueprint === 'findOne') {
          where[Model.primaryKey] = req.options.id || (req.options.where && req.options.where.id) || req.param('id');
          return where;
        }

        // Look for explicitly specified `where` parameter.
        where = req.allParams().where;

        // Validate blacklist to provide a more helpful error msg.
        var blacklist = (req.options.criteria && req.options.criteria.blacklist) || ['limit', 'skip', 'sort', 'populate'];
        if (blacklist && !_.isArray(blacklist)) {
          throw new Error('Invalid `req.options.criteria.blacklist`. Should be an array of strings (parameter names.)');
        }

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

      })();

      //  ┌─┐┌─┐┬─┐┌─┐┌─┐  ┬  ┬┌┬┐┬┌┬┐
      //  ├─┘├─┤├┬┘└─┐├┤   │  │││││ │
      //  ┴  ┴ ┴┴└─└─┘└─┘  ┴─┘┴┴ ┴┴ ┴

      queryOptions.criteria.limit = (function getLimitCriteria() {
        var limit = req.param('limit') || (typeof req.options.limit !== 'undefined' ? req.options.limit : DEFAULT_LIMIT);
        if (limit) { limit = +limit; }
        return limit;
      })();

      //  ┌─┐┌─┐┬─┐┌─┐┌─┐  ┌─┐┬┌─┬┌─┐
      //  ├─┘├─┤├┬┘└─┐├┤   └─┐├┴┐│├─┘
      //  ┴  ┴ ┴┴└─└─┘└─┘  └─┘┴ ┴┴┴

      queryOptions.criteria.skip = (function getSkipCriteria() {
        var skip = req.param('skip') || (typeof req.options.skip !== 'undefined' ? req.options.skip : DEFAULT_SKIP);
        if (skip) { skip = +skip; }
        return skip;
      })();

      //  ┌─┐┌─┐┬─┐┌─┐┌─┐  ┌─┐┌─┐┬─┐┌┬┐
      //  ├─┘├─┤├┬┘└─┐├┤   └─┐│ │├┬┘ │
      //  ┴  ┴ ┴┴└─└─┘└─┘  └─┘└─┘┴└─ ┴

      queryOptions.criteria.sort = (function getSortCriteria() {
        var sort = req.param('sort') || req.options.sort;
        if (_.isUndefined(sort)) {return undefined;}

        // If `sort` is a string, attempt to JSON.parse() it.
        // (e.g. `{"name": 1}`)
        if (_.isString(sort)) {
          try {
            sort = JSON.parse(sort);
          }
          // If it is not valid JSON, then fall back to interpreting it as-is.
          // (e.g. "name ASC")
          catch(e) {}
        }
        return sort;
      })();

      //  ┌─┐┌─┐┬─┐┌─┐┌─┐  ┌─┐┌─┐┌─┐┬ ┬┬  ┌─┐┌┬┐┌─┐
      //  ├─┘├─┤├┬┘└─┐├┤   ├─┘│ │├─┘│ ││  ├─┤ │ ├┤
      //  ┴  ┴ ┴┴└─└─┘└─┘  ┴  └─┘┴  └─┘┴─┘┴ ┴ ┴ └─┘

      queryOptions.populates = (function getPopulates() {

        // To populate or not to populate?
        if (!shouldPopulate) {
          return {};
        }

        // If no `populate` param was set in the request, use the default populates.
        if (!req.param('populate')) {
          return defaultPopulates;
        }

        // Otherwise, filter the attributes to populate against the list in the `populate` param.
        // e.g.:
        //   /model?populate=alias1,alias2,alias3
        //   /model?populate=[alias1,alias2,alias3]
        var attributes = req.param('populate');
        // Remove any square brackets around the list.
        attributes = attributes.replace(/\[|\]/g, '');
        // Split the list on commas.
        attributes = attributes.split(',');
        // Trim whitespace off of the attributes.
        attributes = _.map(attributes, function(attribute) {return attribute.trim();});
        // Filter the default populates.
        return _.pick(defaultPopulates, attributes);

      })();

      break;

    //   ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
    //  ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
    //  ██║     ██████╔╝█████╗  ███████║   ██║   █████╗
    //  ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝
    //  ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
    //   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

    case 'create':
      break;

    //  ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗███████╗
    //  ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██╔════╝
    //  ██║   ██║██████╔╝██║  ██║███████║   ██║   █████╗
    //  ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██╔══╝
    //  ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ███████╗
    //   ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝

    case 'update':
      break;

    //  ██████╗ ███████╗███████╗████████╗██████╗  ██████╗ ██╗   ██╗
    //  ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗╚██╗ ██╔╝
    //  ██║  ██║█████╗  ███████╗   ██║   ██████╔╝██║   ██║ ╚████╔╝
    //  ██║  ██║██╔══╝  ╚════██║   ██║   ██╔══██╗██║   ██║  ╚██╔╝
    //  ██████╔╝███████╗███████║   ██║   ██║  ██║╚██████╔╝   ██║
    //  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝

    case 'destroy':
      break;

    //   █████╗ ██████╗ ██████╗
    //  ██╔══██╗██╔══██╗██╔══██╗
    //  ███████║██║  ██║██║  ██║
    //  ██╔══██║██║  ██║██║  ██║
    //  ██║  ██║██████╔╝██████╔╝
    //  ╚═╝  ╚═╝╚═════╝ ╚═════╝

    case 'add':
      break;

    //  ██████╗ ███████╗███╗   ███╗ ██████╗ ██╗   ██╗███████╗
    //  ██╔══██╗██╔════╝████╗ ████║██╔═══██╗██║   ██║██╔════╝
    //  ██████╔╝█████╗  ██╔████╔██║██║   ██║██║   ██║█████╗
    //  ██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝
    //  ██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗
    //  ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝

    case 'remove':
      break;

    //  ██████╗ ███████╗██████╗ ██╗      █████╗  ██████╗███████╗
    //  ██╔══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔════╝██╔════╝
    //  ██████╔╝█████╗  ██████╔╝██║     ███████║██║     █████╗
    //  ██╔══██╗██╔══╝  ██╔═══╝ ██║     ██╔══██║██║     ██╔══╝
    //  ██║  ██║███████╗██║     ███████╗██║  ██║╚██████╗███████╗
    //  ╚═╝  ╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝

    case 'replace':
      break;

    //  ██████╗  ██████╗ ██████╗ ██╗   ██╗██╗      █████╗ ████████╗███████╗
    //  ██╔══██╗██╔═══██╗██╔══██╗██║   ██║██║     ██╔══██╗╚══██╔══╝██╔════╝
    //  ██████╔╝██║   ██║██████╔╝██║   ██║██║     ███████║   ██║   █████╗
    //  ██╔═══╝ ██║   ██║██╔═══╝ ██║   ██║██║     ██╔══██║   ██║   ██╔══╝
    //  ██║     ╚██████╔╝██║     ╚██████╔╝███████╗██║  ██║   ██║   ███████╗
    //  ╚═╝      ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

    case 'populate':
      break;

  }

  return queryOptions;

};
