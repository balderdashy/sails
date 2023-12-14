/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('@sailshq/lodash');




/**
 * Module errors
 */

var Err = {
  dependency: function (dependent, dependency) {
    return new Error( '\n' +
      'Cannot use `' + dependent + '` hook ' +
      'without the `' + dependency + '` hook enabled!'
    );
  }
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// TODO: Remove this hook altogether, instead splitting its contents between
// the `blueprints` and `sockets` hooks.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * pubsub hook
 *
 * > Implements public resourceful pubsub (RPS) methods, as well as some
 * > private methods used by the blueprints hook.
 */

module.exports = function(sails) {

  // Private function for parsing a potential instance ID.
  var parseId = function (id) {
    if(!_.isObject(this.attributes, this.primaryKey)) {
      return id;
    }
    var pkAttrDef = this.attributes[this.primaryKey];
    if(_.isPlainObject(pkAttrDef)) {
      if (pkAttrDef.type === 'number') {
        return parseInt(id);
      } else if (pkAttrDef.type === 'string') {
        return new String(id).toString(); //jshint ignore:line
      }
    }

    return id;
  };

  /**
   * Check that records are a list, if not, make them a list
   * Also if they are ids, make them dummy objects with an `id` property
   *
   * @param {Object|Array|String|Finite} records
   * @returns {Array} array of things that have an `id` property
   *
   * @api private
   * @synchronous
   */
  var pluralize = function (records) {

    // If `records` is a non-array object,
    // turn it into a single-item array ("pluralize" it)
    // e.g. { id: 7 } -----> [ { id: 7 } ]
    if ( !_.isArray(records) ) {
      var record = records;
      records = [record];
    }

    // If a list of ids things look ids (finite numbers or strings),
    // wrap them up as dummy objects; e.g. [1,2] ---> [ {id: 1}, {id: 2} ]
    var self = this;
    return _.map(records, function (record) {
      if ( _.isString(record) || _.isFinite(record) ) {
        var id = record;
        var data = {};
        data[self.primaryKey] = id;
        return data;
      }
      if (_.isNull(record) || _.isUndefined(record)) {
        throw new Error('Could not coerce value into an array of records!');
      }
      return record;
    });
  };

  /**
   * Expose Hook definition
   */

  return {


    initialize: function(cb) {

      var self = this;

      // If `views` or `orm` hook is not enabled, complain and disable the hook.
      if (!sails.hooks.sockets || !sails.hooks.orm) {
        sails.log.verbose('Cannot use `pubsub` hook without the `sockets` and `orm` hooks enabled!  (Skipping...)');
        delete sails.hooks.pubsub;
        return cb();
      }


      // If `views` or `orm` hook is not enabled, complain and respond w/ error
      if (!sails.hooks.sockets) {
        return cb( Err.dependency('pubsub', 'sockets') );
      }


      if (!sails.hooks.orm) {
        return cb( Err.dependency('pubsub', 'orm') );
      }

      // Wait for `hook:orm:loaded`
      sails.on('hook:orm:loaded', function() {

        // Do the heavy lifting
        self.augmentModels();

        // Indicate that the hook is fully loaded
        cb();

      });

      // When the orm is reloaded, re-apply all of the pubsub methods to the
      // models
      sails.on('hook:orm:reloaded', function() {
        self.augmentModels();

        // Trigger an event in case something needs to respond to the pubsub reload
        sails.emit('hook:pubsub:reloaded');
      });

    },

    augmentModels: function() {
      // Augment models with room/socket logic (& bind context)
      for (var identity in sails.models) {
        var AugmentedModel = _.defaults(sails.models[identity], getPubsubMethods(), {autosubscribe: true} );
        _.bindAll(AugmentedModel,
          'subscribe',
          'unsubscribe',
          'publish',
          '_watch',
          '_room',
          '_introduce',
          '_retire',
          '_publishCreate',
          '_publishUpdate',
          '_publishDestroy',
          '_publishAdd',
          '_publishRemove'
        );
        sails.models[identity] = AugmentedModel;
      }
    }

  };


  /**
   * These methods get appended to the Model class objects
   * Some take req.socket as an argument to get access
   * to user('s|s') socket object(s)
   */

  function getPubsubMethods () {

    return {

      //  ██████╗ ██╗   ██╗██████╗ ██╗     ██╗ ██████╗
      //  ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝
      //  ██████╔╝██║   ██║██████╔╝██║     ██║██║
      //  ██╔═══╝ ██║   ██║██╔══██╗██║     ██║██║
      //  ██║     ╚██████╔╝██████╔╝███████╗██║╚██████╗
      //  ╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝
      //

      /**
       * Broadcast a custom message to sockets connected to the specified records
       * @param {Object|String|Finite} records -- record or ID of record whose subscribers should receive the message
       * @param {Object|Array|String|Finite} data -- the message payload
       * @param {Request|Socket} req - if specified, broadcast using this
       *                         socket (effectively omitting it)
       *
       */

      publish: function(ids, data, req) {

        var self = this;

        // ids is required.
        if (!ids) {
          sails.log.error('`' + self.identity + '.publish` : missing or empty second argument `ids`. API is `.publish(ids, data [, req])`.');
          return;
        }

        // ids must be an array of primary keys -- we'll coerce it (with a warning) if it's not.
        if (!_.isArray(ids) || _.any(ids, function(id) {return !_.isString(id) && !_.isNumber(id);})) {
          sails.log.debug('The first argument passed to `' + self.identity + '.publish()` must be an array of ids.  To subscribe to a single record, wrap the id in an array.');
          try {
            ids = _.pluck(pluralize.apply(this, [ids]), this.primaryKey);
          } catch (err) {
            throw new Error('We tried to transform `' + util.inspect(ids, {depth: 2}) + '` into an array of IDs, but there was a problem (could some values have been `null` or `undefined`?)  Details: '+err.stack);
          }
          sails.log.debug('For example: `[' + ids[0] + ']`');
          sails.log.debug('Wrapping it in an array for you this time...');
        }

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // Ensure that we're working with a clean, unencumbered object
        data = _.cloneDeep(data);

        // Loop through the record IDs to broadcast to.
        _.each(ids, function(id) {
          var room = self._room(id);
          sails.sockets.broadcast( room, self.identity, data, socketToOmit );
        });

      },

      /**
      * Subscribe a socket to a handful of records in this model
      *
      * Usage:
      * Model.subscribe(req, ids)
      *
      * @param {Request|Socket} req - request containing the socket to subscribe, or the socket itself
      * @param {Array} ids - array of ids of instances to subscribe to
      *
      *   // Subscribe to User.update() and User.destroy()
      *   // for the specified instances (or user.save() / user.destroy()):
      *   User.subscribe(req.socket, users)
      *
      * @api public
      */
      subscribe: function (req, ids) {

        var self = this;

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socket = sails.sockets.parseSocket(req);

        // Request must originate from a socket.
        if (!socket) {
          sails.log.debug('`Model.subscribe()` called by a non-socket request. Only requests originating from a connected socket may be subscribed. Ignoring...');
          return;
        }

        if (!ids) {
          sails.log.error('`' + self.identity + '.subscribe` : missing or empty second argument `ids`. API is `.subscribe(request, ids)`.');
          return;
        }

        if (!_.isArray(ids) || _.any(ids, function(id) {return !_.isString(id) && !_.isNumber(id);})) {
          sails.log.debug('The second argument passed to `' + self.identity + '.subscribe()` must be an array of ids.  To subscribe to a single record, wrap the id in an array.');
          try {
            ids = _.pluck(pluralize.apply(this, [ids]), this.primaryKey);
          } catch (err) {
            throw new Error('We tried to transform `' + util.inspect(ids, {depth: 2}) + '` into an array of IDs, but there was a problem (could some values have been `null` or `undefined`?)  Details: '+err.stack);
          }
          sails.log.debug('For example: `[' + ids[0] + ']`');
          sails.log.debug('Wrapping it in an array for you this time...');
        }

        for (let id of ids) {
          // Attempt to join the room for the specified instance.
          sails.sockets.join( socket, self._room(id) );
          sails.log.silly(
            'Subscribed to the ' +
            self.globalId + ' with id=' + id + '\t(room :: ' + self._room(id) + ')'
          );
        }//∞
      },

      /**
       * Unsubscribe a socket from some records
       *
       * Usage:
       * Model.unsubscribe(req, ids)
       *
       * @param {Request|Socket} req - request containing the socket to unsubscribe, or the socket itself
       * @param {Array} ids - array of ids of instances to unsubscribe from
       */

      unsubscribe: function (req, ids) {

        var self = this;

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socket = sails.sockets.parseSocket(req);

        if (!socket) {
          sails.log.debug('`Model.unsubscribe()` called by a non-socket request. Only requests originating from a connected socket may be subscribed. Ignoring...');
          return;
        }

        // If no ids provided, unsubscribe from the class room
        if (!ids) {
          sails.log.error('`' + self.identity + '.unsubscribe` : missing or empty second argument `ids`. API is `.subscribe(request, ids)`.');
          return;
        }

        // ids must be an array of primary keys -- we'll coerce it (with a warning) if it's not.
        if (!_.isArray(ids) || _.any(ids, function(id) {return !_.isString(id) && !_.isNumber(id);})) {
          sails.log.debug('The second argument passed to `' + self.identity + '.unsubscribe()` must be an array of ids.  To subscribe to a single record, wrap the id in an array.');
          try {
            ids = _.pluck(pluralize.apply(this, [ids]), this.primaryKey);
          } catch (err) {
            throw new Error('We tried to transform `' + util.inspect(ids, {depth: 2}) + '` into an array of IDs, but there was a problem (could some values have been `null` or `undefined`?)  Details: '+err.stack);
          }
          sails.log.debug('For example: `[' + ids[0] + ']`');
          sails.log.debug('Wrapping it in an array for you this time...');
        }

        for (let id of ids) {
          // Attempt to leave the room for the specified instance.
          sails.sockets.leave( socket, self._room(id));
          sails.log.silly(
            'Unsubscribed from the ' +
            self.globalId + ' with id=' + id + '\t(room :: ' + self._room(id) + ')'
          );
        }//∞
      },

      /**
       * Get the socket room name for a model instance.
       *
       * Usage:
       * Model.getRoomName(id)
       *
       * @param {Number|String} id - the ID of the instance to get the room name for.
       */

      getRoomName: function(id) {
        return this._room(id);
      },

      //  ██████╗ ██████╗ ██╗██╗   ██╗ █████╗ ████████╗███████╗
      //  ██╔══██╗██╔══██╗██║██║   ██║██╔══██╗╚══██╔══╝██╔════╝
      //  ██████╔╝██████╔╝██║██║   ██║███████║   ██║   █████╗
      //  ██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║   ██║   ██╔══╝
      //  ██║     ██║  ██║██║ ╚████╔╝ ██║  ██║   ██║   ███████╗
      //  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝   ╚══════╝
      //

      /**
       * Broadcast a resourceful pubsub message to sockets connected to the specified records
       * (or null to broadcast to the entire class room)
       *
       * @param {Object|Array|String|Finite} records -- records whose subscribers should receive the message
       * @param {Object|Array|String|Finite} data -- the message payload
       * socket (effectively omitting it)
       *
       * @api private
       */

      _publishRPS: function (records, data, req) {

        var self = this;

        records = pluralize.apply(this, [records]);
        var ids = _.pluck(records, this.primaryKey);
        if ( ids.length === 0 ) {
          sails.log.debug('Can\'t publish a message to an empty list of instances-- ignoring...');
        }

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // Ensure that we're working with a clean, unencumbered object
        data = _.cloneDeep(data);

        // Loop through the record IDs to broadcast to.
        _.each(ids, function(id) {
          sails.sockets.broadcast( self._room(id), self.identity, data, socketToOmit );
        });

      },

      /**
       * @param  {String|Number} id Unique ID (i.e. primary key) of the record to get the room for
       * @param  {String} name Name of the room to get the identifier for
       * @return {String}    name of the instance room for an instance of this model w/ given id
       * @synchronous
       */
      _room: function (id) {

        if (!id) {
          sails.log.error('Must specify an `id` when calling `Model._room(id)`');
          return;
        }

        return 'sails_model_'+this.identity+'_'+id+':'+this.identity;
      },

      /**
       * @return {String} name of this model's global class room
       * @synchronous
       * @api private
       */
      _classRoom: function() {
        return 'sails_model_create_'+this.identity;
      },


      /**
       * Publish an update on a particular model
       *
       * @param {String|Finite} id
       *    - primary key of the instance we're referring to
       *
       * @param {Object} changes
       *    - an object of changes to this instance that will be broadcasted
       *
       * @param {Request|Socket} req - if specified, broadcast using this socket (effectively omitting it)
       *
       * @api public
       */

      _publishUpdate: function (id, changes, req, options) {
        var reverseAssociation;

        // Make sure there's an options object
        options = options || {};

        // Ensure that we're working with a clean, unencumbered object
        changes = _.cloneDeep(changes);

        // Enforce valid usage
        var validId = _.isString(id) || _.isFinite(id);
        if ( !validId  ) {
          return sails.log.error(
            'Invalid usage of `' + this.identity +
            '._publishUpdate(id, changes, [socketToOmit])`'
          );
        }

        if (_.isFunction(this._beforePublishUpdate)) {
          this._beforePublishUpdate(id, changes, req, options);
        }

        // Coerce id to match the attribute type of the primary key of the model
        id = parseId.apply(this,[id]);
        var data = {
          model: this.identity,
          verb: 'update',
          data: changes,
          id: id
        };

        if (options.previous && !options.noReverse) {

          var previous = options.previous;

          // If any of the changes were to association attributes, publish add or remove messages.
          _.each(changes, function(val, key) {

            // If value wasn't changed, do nothing
            if (val === previous[key]) {
              return;
            }

            // Find an association matching this attribute
            var association = _.find(this.associations, {alias: key});

            // If the attribute isn't an assoctiation, return
            if (!association) {
              return;
            }

            // Get the associated model class
            var ReferencedModel = sails.models[association.type === 'model' ? association.model : association.collection];

            // Bail if this attribute isn't in the model's schema
            if (association.type === 'model') {

              var previousPK = _.isObject(previous[key]) ? previous[key][ReferencedModel.primaryKey] : previous[key];
              var newPK = _.isObject(val) ? val[this.primaryKey] : val;
              if (previousPK === newPK) {
                return;
              }

              // Get the inverse association definition, if any
              reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, via: key});

              if (!reverseAssociation) {return;}

              // If this is a to-many association, do _publishAdd or _publishRemove as necessary
              // on the other side
              if (reverseAssociation.type === 'collection') {
                // If there was a previous value, alert the previously associated model
                if (previous[key]) {
                  ReferencedModel._publishRemove(previousPK, reverseAssociation.alias, id, req, {noReverse:true});
                }
                // If there's a new value (i.e. it's not null), alert the newly associated model
                if (val) {
                  ReferencedModel._publishAdd(newPK, reverseAssociation.alias, id, req, {noReverse:true});
                }
              }
              // Otherwise do a _publishUpdate
              else {

                var pubData = {};

                // If there was a previous association, notify it that it has been nullified
                if (previous[key]) {
                  pubData[reverseAssociation.alias] = null;
                  ReferencedModel._publishUpdate(previousPK, pubData, req, {noReverse:true});
                }
                // If there's a new association, notify it that it has been linked
                if (val) {
                  pubData[reverseAssociation.alias] = id;
                  ReferencedModel._publishUpdate(newPK, pubData, req, {noReverse:true});
                }

              }

            }

            else {

              // Get the reverse association definition, if any
              reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, alias: association.via});

              if (!reverseAssociation) {return;}

              // If we can't get the previous PKs (b/c previous isn't populated), bail
              if (_.isUndefined(previous[key])) {
                return;
              }

              // Get the previous set of IDs
              var previousPKs = _.pluck(previous[key], ReferencedModel.primaryKey);
              // Get the current set of IDs
              var updatedPKs = _.map(val, function(_val) {
                if (_.isObject(_val)) {
                  return _val[ReferencedModel.primaryKey];
                } else {
                  return _val;
                }
              });
              // Find any values that were added to the collection
              var addedPKs = _.difference(updatedPKs, previousPKs);
              // Find any values that were removed from the collection
              var removedPKs = _.difference(previousPKs, updatedPKs);

              // If this is a to-many association, do _publishAdd or _publishRemove as necessary
              // on the other side
              if (reverseAssociation.type === 'collection') {

                // Alert any removed models
                _.each(removedPKs, function(pk) {
                  ReferencedModel._publishRemove(pk, reverseAssociation.alias, id, req, {noReverse:true});
                });
                // Alert any added models
                _.each(addedPKs, function(pk) {
                  ReferencedModel._publishAdd(pk, reverseAssociation.alias, id, req, {noReverse:true});
                });

              }
              // Otherwise do a _publishUpdate
              else {

                // Alert any removed models
                _.each(removedPKs, function(pk) {
                  var pubData = {};
                  pubData[reverseAssociation.alias] = null;
                  ReferencedModel._publishUpdate(pk, pubData, req, {noReverse:true});
                });
                // Alert any added models
                _.each(addedPKs, function(pk) {
                  var pubData = {};
                  pubData[reverseAssociation.alias] = id;
                  ReferencedModel._publishUpdate(pk, pubData, req, {noReverse:true});
                });

              }//</else>

            }//</else>
          }, this);//</_.each()>
        }//</ if `previous` and `!noReverse` >

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        data.verb = 'updated';
        data.previous = options.previous;
        delete data.model;

        // Broadcast to the model instance room
        this._publishRPS(id, data, socketToOmit);

        if (_.isFunction(this._afterPublishUpdate)) {
          this._afterPublishUpdate(id, changes, req, options);
        }


      },

      /**
       * Publish the destruction of a particular model
       *
       * @param {String|Finite} id
       *    - primary key of the instance we're referring to
       *
       * @param {Request|Socket} req - if specified, broadcast using this socket (effectively omitting it)
       *
       */

      _publishDestroy: function (id, req, options) {
        var reverseAssociation;

        options = options || {};

        // Enforce valid usage
        var invalidId = !id || _.isObject(id);
        if ( invalidId ) {
          return sails.log.error(
            'Invalid usage of `' + this.identity +
            '._publishDestroy(id, [socketToOmit])`'
          );
        }

        if (_.isFunction(this._beforePublishDestroy)) {
          this._beforePublishDestroy(id, req, options);
        }

        // Coerce id to match the attribute type of the primary key of the model
        id = parseId.apply(this,[id]);

        var data = {
          model: this.identity,
          verb: 'destroy',
          id: id,
          previous: options.previous
        };

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        data.verb = 'destroyed';
        delete data.model;

        // Broadcast to the model instance room
        this._publishRPS(id, data, socketToOmit);

        // Unsubscribe everyone from the model instance
        this._retire(id);

        if (options.previous) {

          var previous = options.previous;

          // Loop through associations and alert as necessary
          _.each(this.associations, function(association) {

            var ReferencedModel;

            // If it's a to-one association, and it wasn't falsy, alert
            // the reverse side
            if (association.type === 'model' && association.alias && previous[association.alias]) {
              ReferencedModel = sails.models[association.model];
              // Get the inverse association definition, if any
              reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity}) || _.find(ReferencedModel.associations, {model: this.identity});

              if (reverseAssociation) {
                // If it's a to-one, publish a simple update alert
                var referencedModelId = _.isObject(previous[association.alias]) ? previous[association.alias][ReferencedModel.primaryKey] : previous[association.alias];
                if (reverseAssociation.type === 'model') {
                  var pubData = {};
                  pubData[reverseAssociation.alias] = null;
                  ReferencedModel._publishUpdate(referencedModelId, pubData, req, {noReverse:true});
                }
                // If it's a to-many, publish a "removed" alert
                else {
                  ReferencedModel._publishRemove(referencedModelId, reverseAssociation.alias, id, req, {noReverse:true});
                }
              }
            }

            else if (association.type === 'collection' && association.via && previous[association.alias] && previous[association.alias].length) {
              ReferencedModel = sails.models[association.collection];
              // Get the inverse association definition, if any
              var reverseAttribute = ReferencedModel.attributes[association.via];
              _.each(previous[association.alias], function(associatedModel) {
                // If it's a to-one, publish a simple update alert
                if (reverseAttribute.model) {
                  var pubData = {};
                  pubData[association.via] = null;
                  ReferencedModel._publishUpdate(associatedModel[ReferencedModel.primaryKey], pubData, req, {noReverse:true});
                }
                // If it's a to-many, publish a "removed" alert
                else {
                  ReferencedModel._publishRemove(associatedModel[ReferencedModel.primaryKey], association.via, id, req, {noReverse:true});
                }
              });
            }

          }, this);

        }

        if (_.isFunction(this._afterPublishDestroy)) {
          this._afterPublishDestroy(id, req, options);
        }

      },


      /**
       * _publishAdd
       *
       * @param  {[type]} id           [description]
       * @param  {[type]} alias        [description]
       * @param  {[type]} idAdded      [description]
       * @param  {[type]} socketToOmit [description]
       */

      _publishAdd: function(id, alias, added, req, options) {
        var reverseAssociation;

        // Make sure there's an options object
        options = options || {};

        // Enforce valid usage
        var invalidId = !id || _.isObject(id);
        var invalidAlias = !alias || !_.isString(alias);
        var invalidAddedId = !added || _.isArray(added);
        if ( invalidId || invalidAlias || invalidAddedId ) {
          return sails.log.error(
            'Invalid usage of `' + this.identity +
            '._publishAdd(id, alias, idAdded|recordAdded, [socketToOmit])`'
          );
        }

        // Get the model on the opposite side of the association
        var reverseModel = sails.models[_.find(this.associations, {alias: alias}).collection];

        // Determine whether `added` was provided as a pk value or an object
        var idAdded;

        // If it is a pk value, we'll turn it into `idAdded`:
        if (!_.isObject(added)) {
          idAdded = added;
          added = undefined;
        }
        // Otherwise we'll leave it as `added` for use below, and determine `idAdded` by examining the object
        // using our knowledge of what the name of the primary key attribute is.
        else {
          idAdded = added[reverseModel.primaryKey];

          // If we don't find a primary key value, we'll log an error and return early.
          if (!_.isString(idAdded) && !_.isNumber(idAdded)) {
            sails.log.error(
            'Invalid usage of _publishAdd(): expected object provided '+
            'for `recordAdded` to have a `%s` attribute', reverseModel.primaryKey
            );
            return;
          }
        }

        // Coerce id to match the attribute type of the primary key of the model
        id = parseId.apply(this,[id]);

        // Coerce idAdded to match the attribute type of the primary key of the reverse model
        idAdded = parseId.apply(reverseModel,[idAdded]);


        // Lifecycle event
        if (_.isFunction(this._beforePublishAdd)) {
          this._beforePublishAdd(id, alias, idAdded, req);
        }

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        this._publishRPS(id, (function (){
          var event = {
            id: id,
            verb: 'addedTo',
            attribute: alias,
            addedId: idAdded
          };
          if (added) {
            event.added = added;
          }
          return event;
        })(), socketToOmit);

        if (!options.noReverse) {

          var data;

          // Subscribe to the model you're adding
          if (req && req.isSocket) {
            data = {};
            data[reverseModel.primaryKey] = idAdded;
            reverseModel.subscribe(req, [idAdded]);
          }

          // Find the reverse association, if any
          reverseAssociation = _.find(reverseModel.associations, {alias: _.find(this.associations, {alias: alias}).via});
          if (reverseAssociation) {
            // If this is a many-to-many association, do a _publishAdd for the
            // other side.
            if (reverseAssociation.type === 'collection') {
              reverseModel._publishAdd(idAdded, reverseAssociation.alias, id, req, {noReverse:true});
            }

            // Otherwise, do a _publishUpdate
            else {
              data = {};
              data[reverseAssociation.alias] = id;
              reverseModel._publishUpdate(idAdded, data, req, {noReverse:true});
            }
          }

        }


        if (_.isFunction(this._afterPublishAdd)) {
          this._afterPublishAdd(id, alias, idAdded, req);
        }

      },


      /**
       * _publishRemove
       *
       * @param  {[type]} id           [description]
       * @param  {[type]} alias        [description]
       * @param  {[type]} idRemoved    [description]
       * @param  {[type]} socketToOmit [description]
       */

      _publishRemove: function(id, alias, idRemoved, req, options) {
        var reverseAssociation;

        // Make sure there's an options object
        options = options || {};

        // Enforce valid usage
        var invalidId = !id || _.isObject(id);
        var invalidAlias = !alias || !_.isString(alias);
        var invalidRemovedId = !idRemoved || _.isObject(idRemoved);
        if ( invalidId || invalidAlias || invalidRemovedId ) {
          return sails.log.error(
            'Invalid usage of `' + this.identity +
            '._publishRemove(id, alias, idRemoved, [socketToOmit])`'
          );
        }
        if (_.isFunction(this._beforePublishRemove)) {
          this._beforePublishRemove(id, alias, idRemoved, req);
        }

        // Get the reverse model.
        var reverseModel = sails.models[_.find(this.associations, {alias: alias}).collection];

        // Coerce id to match the attribute type of the primary key of the model
        id = parseId.apply(this,[id]);

        // Coerce idRemoved to match the attribute type of the primary key of the reverse model
        idRemoved = parseId.apply(reverseModel,[idRemoved]);

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        this._publishRPS(id, {
          id: id,
          verb: 'removedFrom',
          attribute: alias,
          removedId: idRemoved
        }, socketToOmit);


        if (!options.noReverse) {

          // Get the reverse association, if any.
          reverseAssociation = _.find(reverseModel.associations, {alias: _.find(this.associations, {alias: alias}).via});

          if (reverseAssociation) {
            // If this is a many-to-many association, do a _publishAdd for the
            // other side.
            if (reverseAssociation.type === 'collection') {
              reverseModel._publishRemove(idRemoved, reverseAssociation.alias, id, req, {noReverse:true});
            }

            // Otherwise, do a _publishUpdate
            else {
              var data = {};
              data[reverseAssociation.alias] = null;
              reverseModel._publishUpdate(idRemoved, data, req, {noReverse:true});
            }
          }

        }

        if (_.isFunction(this._afterPublishRemove)) {
          this._afterPublishRemove(id, alias, idRemoved, req);
        }

      },

      /**
       * Publish the creation of model or an array of models
       *
       * @param {[Object]|Object} models
       *                - the data to publish
       *
       * @param {Request|Socket} req - Optional request for broadcast.
       * @api private
       */
      _publishCreate: function(models, req, options){
        var self = this;

        // Pluralize so we can use this method regardless of it is an array or not
        models = pluralize.apply(this, [models]);

        //Publish all models
        _.each(models, function(values){
          self._publishCreateSingle(values, req, options);
        });
      },
      /**
       * Publish the creation of a model
       *
       * @param {Object} values
       *                - the data to publish
       *
       * @param {Request|Socket} req - if specified, broadcast using this socket (effectively omitting it)
       * @api private
       */

      _publishCreateSingle: function(values, req, options) {
        var reverseAssociation;

        options = options || {};

        if (_.isUndefined(values[this.primaryKey])) {
          return sails.log.error(
            'Invalid usage of _publishCreate() :: ' +
            'Values must have an `'+this.primaryKey+'`, instead got ::\n' +
            util.inspect(values)
          );
        }

        if (_.isFunction(this._beforePublishCreate)) {
          this._beforePublishCreate(values, req);
        }

        var id = values[this.primaryKey];

        // Coerce id to match the attribute type of the primary key of the model
        id = parseId.apply(this,[id]);

        // If any of the added values were association attributes, publish add or remove messages.
        _.each(values, function(val, key) {

          // If the user hasn't yet given this association a value, bail out
          if (val === null) {
            return;
          }

          var association = _.find(this.associations, {alias: key});

          // If the attribute isn't an assoctiation, return
          if (!association) {
            return;
          }

          // Get the associated model class
          var ReferencedModel = sails.models[association.type === 'model' ? association.model : association.collection];

          // Bail if the model doesn't exist
          if (!ReferencedModel) {
            return;
          }


          // Bail if this attribute isn't in the model's schema
          if (association.type === 'model') {

            // Get the inverse association definition, if any
            reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, via: key});

            if (!reverseAssociation) {return;}

            // If this is a to-many association, do _publishAdd on the other side
            if (reverseAssociation.type === 'collection') {
              ReferencedModel._publishAdd(
                // Depending on the `populate` setting, the val could be an object or a primary key,
                // so we'll allow for both.
                val[ReferencedModel.primaryKey] || val,
                reverseAssociation.alias,
                id,
                req,
                {noReverse:true}
              );
            }

          }

          else {

            // Get the inverse association definition, if any
            reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, alias: association.via});

            if (!reverseAssociation) {return;}

            // If this is a to-many association, do publishAdds on the other side
            if (reverseAssociation.type === 'collection') {

              // Alert any added models
              _.each(val, function(pk) {
                // Depending on the `populate` setting, the val could be an object or a primary key,
                // so we'll allow for both.
                if (_.isObject(pk)) {
                  pk = pk[ReferencedModel.primaryKey];
                }
                ReferencedModel._publishAdd(pk, reverseAssociation.alias, id, req, {noReverse:true});
              });

            }

            // Otherwise do a _publishUpdate
            else {
              // Alert any added models
              _.each(val, function(pk) {
                // Depending on the `populate` setting, the val could be an object or a primary key,
                // so we'll allow for both.
                if (_.isObject(pk)) {
                  pk = pk[ReferencedModel.primaryKey];
                }
                var pubData = {};
                pubData[reverseAssociation.alias] = id;
                ReferencedModel._publishUpdate(pk, pubData, req, {noReverse:true});
              });

            }

          }

        }, this);

        // Ensure that we're working with a plain object
        values = _.clone(values);

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // Publish to classroom
        var payload = {
          verb: 'created',
          data: values,
          id: values[this.primaryKey]
        };
        sails.log.silly('Published message to ', this._classRoom(), ': ', payload);
        var eventName = this.identity;
        sails.sockets.broadcast(this._classRoom(), eventName, payload, socketToOmit);

        // Subscribe watchers to the new instance
        if (!options.noIntroduce) {
          this._introduce(values[this.primaryKey]);
        }

        if (_.isFunction(this._afterPublishCreate)) {
          this._afterPublishCreate(values, req);
        }

      },


      /**
       *
       * @return {[type]} [description]
       */
      _watch: function ( req ) {

        var socket = sails.sockets.parseSocket(req);

        if (!socket) {
          sails.log.debug('`Model._watch()` called by a non-socket request. Only requests originating from a connected socket may be subscribed. Ignoring...');
          return;
        }//-•

        sails.sockets.join(socket, this._classRoom());
        sails.log.silly('Subscribed socket ', sails.sockets.getId(socket), 'to', this._classRoom());

      },

      /**
       * Introduce a new instance
       *
       * Take all of the subscribers to the class room and 'introduce' them
       * to a new instance room
       *
       * @param {String|Finite} id
       *    - primary key of the instance we're referring to
       *
       * @api private
       */

      _introduce: function(model) {

        var self = this;

        // Get the instance ID
        var id = model[this.primaryKey] || model;

        // Use addRoomMembersToRooms to subscribe everyone in the class room to the model identity instance room
        sails.sockets.addRoomMembersToRooms(self._classRoom(), self._room(id) );

      },

      /**
       * Bid farewell to a destroyed instance
       * Take all of the socket subscribers in this instance room
       * and unsubscribe them from it
       */
      _retire: function(model) {

        var self = this;

        // Get the instance ID
        var id = model[this.primaryKey] || model;

        // Use removeRoomMembersFromRooms to unsubscribe everyone in the class room from the model identity instance room
        sails.sockets.removeRoomMembersFromRooms(self._classRoom(), self._room(id) );
      }

    };
  }

};
