/**
 * Add a member to an association
 *
 * @param {Integer|String} id  - the unique id of the parent record
 * @param {Integer|String} childid  - the unique id of the child record to add
 *
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

var actionUtil = require('../actionUtil');

module.exports = function add(req, res) {

  // Ensure a model and alias can be deduced from the request.
  var Model = actionUtil.parseModel(req);
  var relation = req.options.alias;
  if (!relation) return new Error('Missing required route option, `req.options.alias`.');

  if (!req.param('parentid')) throw new Error('No `parentid` provided.');

  var child;

  // Get the child to add either from the body, or the query string
  if (req.method.toLowerCase() == 'post') {
    child = req.body;
    if (!child) {
      throw new Error('You must provide an object to add (either a new child or an existing one with a primary key)');
    }
  } else {
    if (!req.param('id')) throw new Error('No `id` provided (primary key of the record to be added.)');
    child = req.param('id');
  }

  Model.findOne(req.param('parentid')).exec({
    error: res.serverError,
    success: function found(matchingRecord) {
      if (!matchingRecord) return res.notFound();
      if (!matchingRecord[relation]) return res.notFound();

      var associated = matchingRecord[relation];

      async.auto({
        // Find or create the new child and get their ID
        child: function(cb) {
          if (sails.util.isPlainObject(child)) {
            // Get the associated model
            var association = sails.util.findWhere(Model.associations, {alias: relation});
            var associatedModel = sails.models[association.model || association.collection];
            var criteria = {};
            if (child[associatedModel.primaryKey]) {
                criteria[associatedModel.primaryKey] = child[associatedModel.primaryKey];
            } else {
              criteria[associatedModel.primaryKey] = null;
            }
            associatedModel.findOrCreate(criteria, child).exec(function(err, model) {
              if (err) {return res.serverError(err);}
              return cb(null, model[associatedModel.primaryKey]);
            });
          } else {
            return cb(null, child);
          }
        },
        // Add the new child to the parent
        add: ['child', function(cb, results) {
          try {
            associated.add(results.child);
            cb();
          }
          catch (err) {
            // Ignore `insert` errors
            if (err && err.type !== 'insert') return res.serverError(err);
          }
        }]
      },

        // Save the parent
        function (err, results) {

          matchingRecord.save(function (err) {

            // Differentiate between waterline-originated validation errors
            // and serious underlying issues. Respond with badRequest if a
            // validation error is encountered, w/ validation info.
            if (err && err.status === 400) return res.badRequest(err);

            // Ignore `insert` errors for duplicate adds
            // (but keep in mind, we should not publishAdd if this is the case...)
            var isDuplicateInsertError = (err && err[0] && err[0].type === 'insert');
            if (err && !isDuplicateInsertError) return res.serverError(err);

            // If we have the pubsub hook, use the model class's publish method
            // to notify all subscribers about the added item
            if (!isDuplicateInsertError && req._sails.hooks.pubsub) {

              // Subscribe to the model you're adding to, if this was a socket request
              if (req.isSocket) {
                Model.subscribe(req, matchingRecord);
              }

              // Publish to subscribed sockets
              Model.publishAdd(matchingRecord[Model.primaryKey], relation, results.child, !req.options.mirror && req);

            }

            Model
            .findOne(req.param('parentid'))
            .populate(relation)
            .exec({
              error: res.serverError,
              success: function found(matchingRecord) {
                if (!matchingRecord) return res.serverError();
                if (!matchingRecord[relation]) return res.serverError();
                return res.json(matchingRecord);
              }
            });
          });

        }
      );
    }
  });

};
