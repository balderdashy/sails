/**
 * Module dependencies.
 */
var util = require('util')
  , _ = require('lodash')
  , getSDKMetadata = require('../sockets/lib/getSDKMetadata')
  , STRINGFILE = require('sails-stringfile');


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


module.exports = function(sails) {


  /**
   * Expose Hook definition
   */

  return {


    initialize: function(cb) {

      var self = this;

      // If `views` and `http` hook is not enabled, complain and respond w/ error
      if (!sails.hooks.sockets) {
        return cb( Err.dependency('pubsub', 'sockets') );
      }

      // Add low-level, generic socket methods.  These are mostly just wrappers

      // around socket.io, to enforce a little abstraction.
      addLowLevelSocketMethods();

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
          'watch',
          'introduce',
          'retire',
          'unwatch',
          'unsubscribe',
          'publish',
          'room',
          'publishCreate',
          'publishUpdate',
          'publishDestroy',
          'publishAdd',
          'publishRemove'
        );
        sails.models[identity] = AugmentedModel;
      }
    }
  };

  function addLowLevelSocketMethods () {

    sails.sockets = {};
    sails.sockets.DEFAULT_EVENT_NAME = 'message';

    sails.sockets.subscribeToFirehose = require('./drink')(sails);
    sails.sockets.unsubscribeFromFirehose = require('./drink')(sails);

    sails.sockets.publishToFirehose = require('./squirt')(sails);


    /**
     * Subscribe a socket to a generic room
     * @param  {object} socket   The socket to subscribe.
     * @param  {string} roomName The room to subscribe to
     */
    sails.sockets.join = function(sockets, roomName) {

      if (!sails.util.isArray(sockets)) {
        sockets = [sockets];
      }

      sails.util.each(sockets, function(socket) {
        // If a string was sent, try to look up a socket with that ID
        if (typeof socket == 'string') {socket = sails.io.sockets.socket(socket);}

        // If it's not a valid socket object, bail
        if (! (socket && socket.manager) ) {
          sails.log.warn("Attempted to call `sails.sockets.join`, but the first argument was not a socket.");
          return;
        }
        // Join up!
        socket.join(roomName);

      });

      return true;

    };

    /**
     * Unsubscribe a socket from a generic room
     * @param  {object} socket   The socket to unsubscribe.
     * @param  {string} roomName The room to unsubscribe from
     */
    sails.sockets.leave = function(sockets, roomName) {

      if (!sails.util.isArray(sockets)) {
        sockets = [sockets];
      }

      sails.util.each(sockets, function(socket) {
        // If a string was sent, try to look up a socket with that ID
        if (typeof socket == 'string') {socket = sails.io.sockets.socket(socket);}

        // If it's not a valid socket object, bail
        if (! (socket && socket.manager) ) {
          sails.log.warn("Attempted to call `sails.sockets.leave`, but the first argument was not a socket.");
          return;
        }

        // See ya!
        socket.leave(roomName);
      });

      return true;
    };

    /**
     * Broadcast a message to a room
     *
     * If the event name is omitted, "message" will be used by default.
     * Thus, sails.sockets.broadcast(roomName, data) is also a valid usage.
     *
     * @param  {string} roomName The room to broadcast a message to
     * @param  {string} eventName    The event name to broadcast
     * @param  {object} data     The data to broadcast
     * @param  {object} socket   Optional socket to omit
     */

    sails.sockets.broadcast = function(roomName, eventName, data, socketToOmit) {

      // If the 'eventName' is an object, assume the argument was omitted and
      // parse it as data instead.
      if (typeof eventName === 'object') {
        data = eventName;
        eventName = null;
      }

      // Default to the sails.sockets.DEFAULT_EVENT_NAME.
      if (!eventName) {
        eventName = sails.sockets.DEFAULT_EVENT_NAME;
      }

      // If we were given a valid socket to omit, broadcast from there.
      if (socketToOmit && socketToOmit.manager) {
        socketToOmit.broadcast.to(roomName).emit(eventName, data);
      }
      // Otherwise broadcast to everyone
      else {
        sails.io.sockets.in(roomName).emit(eventName, data);
      }
    };



    /**
     * Broadcast a message to all connected sockets
     *
     * If the event name is omitted, sails.sockets.DEFAULT_EVENT_NAME will be used by default.
     * Thus, sails.sockets.blast(data) is also a valid usage.
     *
     * @param  {string} event    The event name to broadcast
     * @param  {object} data     The data to broadcast
     * @param  {object} socket   Optional socket to omit
     */

    sails.sockets.blast = function(eventName, data, socketToOmit) {

      // If the 'eventName' is an object, assume the argument was omitted and
      // parse it as data instead.
      if (typeof eventName === 'object') {
        data = eventName;
        eventName = null;
      }

      // Default to the sails.sockets.DEFAULT_EVENT_NAME eventName.
      if (!eventName) {
        eventName = sails.sockets.DEFAULT_EVENT_NAME;
      }

      // If we were given a valid socket to omit, broadcast from there.
      if (socketToOmit && socketToOmit.manager) {
        socketToOmit.broadcast.emit(eventName, data);
      }

      // Otherwise broadcast to everyone
      else {
        sails.io.sockets.emit(eventName, data);
      }
    };




    /**
     * Get the ID of a socket object
     * @param  {object} socket The socket object to get the ID of
     * @return {string}        The socket's ID
     */
    sails.sockets.id = function(socket) {
      // If a request was passed in, get its socket
      socket = socket.socket || socket;
      if (socket) {
        return socket.id;
      }
      else return undefined;
    };

    /**
     * Emit a message to one or more sockets by ID
     *
     * If the event name is omitted, "message" will be used by default.
     * Thus, sails.sockets.emit(socketIDs, data) is also a valid usage.
     *
     * @param  {array|string} socketIDs The ID or IDs of sockets to send a message to
     * @param  {string} event     The name of the message to send
     * @param  {object} data      Optional data to send with the message
     */
    sails.sockets.emit = function(socketIDs, eventName, data) {
      if (!_.isArray(socketIDs)) {
        socketIDs = [socketIDs];
      }

      if (typeof eventName === 'object') {
        data = eventName;
        eventName = null;
      }

      if (!eventName) {
        eventName = sails.sockets.DEFAULT_EVENT_NAME;
      }

      _.each(socketIDs, function(socketID) {
        sails.io.sockets.socket(socketID).emit(eventName, data);
      });
    };

    /**
     * Get the list of sockets subscribed to a room
     * @param  {string} roomName The room to get subscribers of
     * @param  {boolean} returnSockets If true, return socket instances rather than IDs.
     * @return {array} An array of socket ID strings
     */
    sails.sockets.subscribers = function(roomName, returnSockets) {
      if (returnSockets) {
        return sails.io.sockets.clients(roomName);
      } else {
        return _.pluck(sails.io.sockets.clients(roomName), 'id');
      }
    };

    /**
     * Get the list of rooms a socket is subscribed to
     * @param  {object} socket The socket to get rooms for
     * @return {array} An array of room names
     */
    sails.sockets.socketRooms = function(socket) {
      return _.map(_.keys(sails.io.sockets.manager.roomClients[socket.id]), function(roomName) {return roomName.replace(/^\//,'');});
    };

    /**
     * Get the list of all rooms
     * @return {array} An array of room names, minus the empty room
     */
    sails.sockets.rooms = function() {
      var rooms = sails.util.clone(sails.io.sockets.manager.rooms);
      delete rooms[""];
      return sails.util.map(sails.util.keys(rooms), function(room){return room.substr(1);});
    };

  }

  /**
   * These methods get appended to the Model class objects
   * Some take req.socket as an argument to get access
   * to user('s|s') socket object(s)
   */

  function getPubsubMethods () {

    return {

      /**
       * Broadcast a message to a room
       *
       * Wrapper for sails.sockets.broadcast
       * Can be overridden at a model level, i.e. for encapsulating messages within a single event name.
       *
       * @param  {string} roomName The room to broadcast a message to
       * @param  {string} eventName    The event name to broadcast
       * @param  {object} data     The data to broadcast
       * @param  {object} socket   Optional socket to omit
       *
       * @api private
       */

      broadcast: function(roomName, eventName, data, socketToOmit) {
        sails.sockets.broadcast(roomName, eventName, data, socketToOmit);
      },


      /**
       * TODO: document
       */
      getAllContexts: function() {

        var contexts = ['update', 'destroy', 'message'];
        _.each(this.associations, function(association) {
          if (association.type == 'collection') {
            contexts.push('add:'+association.alias);
            contexts.push('remove:'+association.alias);
          }
        });
        return contexts;

      },

      /**
       * Broadcast a custom message to sockets connected to the specified models
       * @param {Object|String|Finite} record -- record or ID of record whose subscribers should receive the message
       * @param {Object|Array|String|Finite} message -- the message payload
       * @param {Request|Socket} req - if specified, broadcast using this
       * socket (effectively omitting it)
       *
       */

      message: function(record, data, req) {

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // If no records provided, throw an error
        if (!record) {
          return sails.log.error(
            util.format(
            'Must specify a record or record ID when calling `Model.publish` '+
            '(you specified: `%s`)', record));
        }

        // Otherwise publish to each instance room
        else {

          // Get the record ID (if the record argument isn't already a scalar)
          var id = record[this.primaryKey] || record;
          // Get the socket room to publish to
          var room = this.room(id, "message");
          // Create the payload
          var payload = {
            verb: "messaged",
            id: id,
            data: data
          };

          this.broadcast( room, this.identity, payload, socketToOmit );
          sails.log.silly("Published message to ", room, ": ", payload);

        }

      },

      /**
       * Broadcast a message to sockets connected to the specified models
       * (or null to broadcast to the entire class room)
       *
       * @param {Object|Array|String|Finite} models -- models whose subscribers should receive the message
       * @param {String} eventName -- the event name to broadcast with
       * @param {String} context -- the context to broadcast to
       * @param {Object|Array|String|Finite} data -- the message payload
       * socket (effectively omitting it)
       *
       * @api private
       */

      publish: function (models, eventName, context, data, req) {
        var self = this;

        // If the event name is an object, assume we're seeing `publish(models, data, req)`
        if (typeof eventName === 'object') {
          req = context;
          context = null;
          data = eventName;
          eventName = null;
        }

        // Default to the event name being the model identity
        if (!eventName) {
          eventName = this.identity;
        }

        // If the context is an object, assume we're seeing `publish(models, eventName, data, req)`
        if (typeof context === 'object' && context !== null) {
          req = data;
          data = context;
          context = null;
        }

        // Default to using the message context
        if (!context) {
          sails.log.warn('`Model.publish` should specify a context; defaulting to "message".  Try `Model.message` instead?');
          context = 'message';
        }

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // If no models provided, publish to the class room
        if (!models) {
          STRINGFILE.logDeprecationNotice(
            'Model.publish(null, ...)',
              STRINGFILE.get('links.docs.sockets.pubsub'),
              sails.log.debug) &&
          STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

          sails.log.silly('Published ', eventName, ' to ', self.classRoom());
          self.broadcast( self.classRoom(), eventName, data, socketToOmit );
          return;
        }

        // Otherwise publish to each instance room
        else {
          models = this.pluralize(models);
          var ids = _.pluck(models, this.primaryKey);
          if ( ids.length === 0 ) {
            sails.log.warn('Can\'t publish a message to an empty list of instances-- ignoring...');
          }
          _.each(ids,function eachInstance (id) {
            var room = self.room(id, context);
            sails.log.silly("Published ", eventName, " to ", room);
            self.broadcast( room, eventName, data, socketToOmit );


            // Also broadcasts a message to the legacy instance room (derived by
            // using the `legacy_v0.9` context).
            // Uses traditional eventName === "message".
            // Uses traditional message format.
            if (sails.config.sockets['backwardsCompatibilityFor0.9SocketClients']) {
              var legacyRoom = self.room(id, 'legacy_v0.9');
              var legacyMsg = _.cloneDeep(data);
              legacyMsg.model = self.identity;
              if (legacyMsg.verb === 'created') { legacyMsg.verb = 'create'; }
              if (legacyMsg.verb === 'updated') { legacyMsg.verb = 'update'; }
              if (legacyMsg.verb === 'destroyed') { legacyMsg.verb = 'destroy'; }
              self.broadcast( legacyRoom, 'message', legacyMsg, socketToOmit );
            }
          });
        }

      },

      /**
       * Check that models are a list, if not, make them a list
       * Also if they are ids, make them dummy objects with an `id` property
       *
       * @param {Object|Array|String|Finite} models
       * @returns {Array} array of things that have an `id` property
       *
       * @api private
       * @synchronous
       */
      pluralize: function (models) {

        // If `models` is a non-array object,
        // turn it into a single-item array ("pluralize" it)
        // e.g. { id: 7 } -----> [ { id: 7 } ]
        if ( !_.isArray(models) ) {
          var model = models;
          models = [model];
        }

        // If a list of ids things look ids (finite numbers or strings),
        // wrap them up as dummy objects; e.g. [1,2] ---> [ {id: 1}, {id: 2} ]
        var self = this;
        return _.map(models, function (model) {
          if ( _.isString(model) || _.isFinite(model) ) {
            var id = model;
            var data = {};
            data[self.primaryKey] = id;
            return data;
          }
          return model;
        });
      },

      /**
       * @param  {String|} id
       * @return {String}    name of the instance room for an instance of this model w/ given id
       * @synchronous
       */
      room: function (id, context) {
        if (!id) return sails.log.error('Must specify an `id` when calling `Model.room(id)`');
        return 'sails_model_'+this.identity+'_'+id+':'+context;
      },

      classRoom: function () {
        STRINGFILE.logDeprecationNotice(
          'Model.classRoom',
            STRINGFILE.get('links.docs.sockets.pubsub'),
            sails.log.debug) &&
        STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

        return this._classRoom();
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
       * Return the set of sockets subscribed to this instance
       * @param  {String|Integer} id
       * @return {Array[Socket]}
       * @synchronous
       * @api private
       */
      subscribers: function (id, context) {
        // For a single context, return just the socket subscribed to that context
        if (context) {
          return sails.sockets.subscribers(this.room(id, context), true);
        }
        // Otherwise return the unique set of sockets subscribed to ALL contexts
        //
        // TODO: handle custom contexts here, which aren't returned by getAllContexts
        // Not currently a big issue since `publish` is a private API, so subscribing
        // to a custom context doesn't let you do much.
        var contexts = this.getAllContexts();
        var subscribers = [];
        _.each(contexts, function(context) {
          subscribers = _.union(subscribers, this.subscribers(id, context));
        }, this);
        return _.uniq(subscribers);
      },

      /**
       * Return the set of sockets subscribed to this class room
       * @return {Array[Socket]}
       * @synchronous
       * @api private
       */
      watchers: function() {
        return sails.sockets.subscribers(this._classRoom(), true);
      },

      /**
      * Subscribe a socket to a handful of records in this model
      *
      * Usage:
      * Model.subscribe(req,socket [, records] )
      *
      * @param {Request|Socket} req - request containing the socket to subscribe, or the socket itself
      * @param {Object|Array|String|Finite} records - id, array of ids, model, or array of records
      *
      * e.g.
      *   // Subscribe to User.create()
      *   User.subscribe(req.socket)
      *
      *   // Subscribe to User.update() and User.destroy()
      *   // for the specified instances (or user.save() / user.destroy())
      *   User.subscribe(req.socket, users)
      *
      * @api public
      */
      subscribe: function (req, records, contexts) {
        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socket = req.socket ? req.socket : req;

        if (!socket.manager) {
          return sails.log.warn('`Model.subscribe()` called by a non-socket request. Only requests originating from a connected socket may be subscribed. Ignoring...');
        }

        var self = this;

        // Subscribe to class room to hear about new records
        if (!records) {
          sails.log.warn('Missing or empty second argument `records`. API is `.subscribe(request, records [, contexts])`.');
          STRINGFILE.logDeprecationNotice(
            'Model.subscribe(socket, null, ...)',
              STRINGFILE.get('links.docs.sockets.pubsub'),
              sails.log.debug) &&
          STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

          this.watch(req);
          return;
        }

        contexts = contexts || this.autosubscribe;

        if (!contexts) {
          sails.log.warn("`subscribe` called without context on a model with autosubscribe:false.  No action will be taken.");
          return;
        }

        if (contexts === true || contexts == '*') {
          contexts = this.getAllContexts();
        } else if (sails.util.isString(contexts)) {
          contexts = [contexts];
        }


        // If the subscribing socket is using the legacy (v0.9.x) socket SDK (sails.io.js),
        // always subscribe the client to the `legacy_v0.9` context.
        if (sails.config.sockets['backwardsCompatibilityFor0.9SocketClients'] && socket.handshake) {
          var sdk = getSDKMetadata(socket.handshake);
          var isLegacySocketClient = sdk.version === '0.9.0';
          if (isLegacySocketClient) {
            contexts.push('legacy_v0.9');
          }
        }

        // Subscribe to model instances
        records = self.pluralize(records);
        var ids = _.pluck(records, this.primaryKey);

        _.each(ids,function (id) {
          _.each(contexts, function(context) {
            sails.log.silly(
              'Subscribed to the ' +
              self.globalId + ' with id=' + id + '\t(room :: ' + self.room(id, context) + ')'
            );

            sails.sockets.join( socket, self.room(id, context) );
          });
        });
      },

      /**
       * Unsubscribe a socket from some records
       *
       * @param {Request|Socket} req - request containing the socket to unsubscribe, or the socket itself
       * @param {Object|Array|String|Finite} models - id, array of ids, model, or array of models
       */

      unsubscribe: function (req, records, contexts) {

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socket = req.socket ? req.socket : req;

        if (!socket.manager) {
          return sails.log.warn('`Model.unsubscribe()` called by a non-socket request. Only requests originating from a connected socket may be subscribed. Ignoring...');
        }

        var self = this;

        // If no records provided, unsubscribe from the class room
        if (!records) {
          STRINGFILE.logDeprecationNotice(
            'Model.unsubscribe(socket, null, ...)',
              STRINGFILE.get('links.docs.sockets.pubsub'),
              sails.log.debug) &&
          STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

          this.unwatch();

        }

        contexts = contexts || this.getAllContexts();

        if (contexts === true) {
          contexts = this.getAllContexts();
        }

        if (sails.config.sockets['backwardsCompatibilityFor0.9SocketClients'] && socket.handshake) {
          var sdk = getSDKMetadata(socket.handshake);
          var isLegacySocketClient = sdk.version === '0.9.0';
          if (isLegacySocketClient) {
            contexts.push('legacy_v0.9');
          }
        }

        records = self.pluralize(records);
        var ids = _.pluck(records, this.primaryKey);
        _.each(ids,function (id) {
          _.each(contexts, function(context) {
            sails.log.silly(
              'Unsubscribed from the ' +
              self.globalId + ' with id=' + id + '\t(room :: ' + self.room(id, context) + ')'
            );
            sails.sockets.leave( socket, self.room(id, context));
          });
        });
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

      publishUpdate: function (id, changes, req, options) {

        // Make sure there's an options object
        options = options || {};

        // Ensure that we're working with a clean, unencumbered object
        changes = _.clone(changes);

        // Enforce valid usage
        var validId = _.isString(id) || _.isFinite(id);
        if ( !validId  ) {
          return sails.log.error(
            'Invalid usage of ' +
            '`' + this.identity + '.publishUpdate(id, changes, [socketToOmit])`'
          );
        }

        if (sails.util.isFunction(this.beforePublishUpdate)) {
          this.beforePublishUpdate(id, changes, req, options);
        }

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
            if (val == previous[key]) return;

            // Find an association matching this attribute
            var association = _.find(this.associations, {alias: key});

            // If the attribute isn't an assoctiation, return
            if (!association) return;

            // Get the associated model class
            var ReferencedModel = sails.models[association.type == 'model' ? association.model : association.collection];

            // Bail if this attribute isn't in the model's schema
            if (association.type == 'model') {

              var previousPK = _.isObject(previous[key]) ? previous[key][ReferencedModel.primaryKey] : previous[key];
              var newPK = _.isObject(val) ? val[this.primaryKey] : val;
              if (previousPK == newPK) return;

              // Get the inverse association definition, if any
              reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, via: key});

                if (!reverseAssociation) {return;}

                // If this is a to-many association, do publishAdd or publishRemove as necessary
                // on the other side
                if (reverseAssociation.type == 'collection') {
                  // If there was a previous value, alert the previously associated model
                  if (previous[key]) {
                    ReferencedModel.publishRemove(previousPK, reverseAssociation.alias, id, {noReverse:true});
                  }
                  // If there's a new value (i.e. it's not null), alert the newly associated model
                  if (val) {
                    ReferencedModel.publishAdd(newPK, reverseAssociation.alias, id, {noReverse:true});
                  }
                }
                // Otherwise do a publishUpdate
                else {

                  var pubData = {};

                  // If there was a previous association, notify it that it has been nullified
                  if (previous[key]) {
                    pubData[reverseAssociation.alias] = null;
                    ReferencedModel.publishUpdate(previousPK, pubData, req, {noReverse:true});
                  }
                  // If there's a new association, notify it that it has been linked
                  if (val) {
                    pubData[reverseAssociation.alias] = id;
                    ReferencedModel.publishUpdate(newPK, pubData, req, {noReverse:true});
                  }

                }

            }

            else {

              // Get the reverse association definition, if any
              reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, alias: association.via});

              if (!reverseAssociation) {return;}

                // If we can't get the previous PKs (b/c previous isn't populated), bail
                if (typeof(previous[key]) == 'undefined') return;

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

                // If this is a to-many association, do publishAdd or publishRemove as necessary
                // on the other side
                if (reverseAssociation.type == 'collection') {

                  // Alert any removed models
                  _.each(removedPKs, function(pk) {
                    ReferencedModel.publishRemove(pk, reverseAssociation.alias, id, {noReverse:true});
                  });
                  // Alert any added models
                  _.each(addedPKs, function(pk) {
                    ReferencedModel.publishAdd(pk, reverseAssociation.alias, id, {noReverse:true});
                  });

                }

                // Otherwise do a publishUpdate
                else {

                  // Alert any removed models
                  _.each(removedPKs, function(pk) {
                    var pubData = {};
                    pubData[reverseAssociation.alias] = null;
                    ReferencedModel.publishUpdate(pk, pubData, req, {noReverse:true});
                  });
                  // Alert any added models
                  _.each(addedPKs, function(pk) {
                    var pubData = {};
                    pubData[reverseAssociation.alias] = id;
                    ReferencedModel.publishUpdate(pk, pubData, req, {noReverse:true});
                  });

                }

            }
          }, this);
        }

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // In development environment, blast out a message to everyone
        sails.sockets.publishToFirehose(data);

        data.verb = 'updated';
        data.previous = options.previous;
        delete data.model;

        // Broadcast to the model instance room
        this.publish(id, this.identity, 'update', data, socketToOmit);

        if (sails.util.isFunction(this.afterPublishUpdate)) {
          this.afterPublishUpdate(id, changes, req, options);
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

      publishDestroy: function (id, req, options) {

        options = options || {};

        // Enforce valid usage
        var invalidId = !id || _.isObject(id);
        if ( invalidId ) {
          return sails.log.error(
            'Invalid usage of ' + this.identity +
            '`publishDestroy(id, [socketToOmit])`'
          );
        }

        if (sails.util.isFunction(this.beforePublishDestroy)) {
          this.beforePublishDestroy(id, req, options);
        }


        var data = {
          model: this.identity,
          verb: 'destroy',
          id: id,
          previous: options.previous
        };

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // In development environment, blast out a message to everyone
        sails.sockets.publishToFirehose(data);

        data.verb = 'destroyed';
        delete data.model;

        // Broadcast to the model instance room
        this.publish(id, this.identity, 'destroy', data, socketToOmit);

        // Unsubscribe everyone from the model instance
        this.retire(id);

        if (options.previous) {

          var previous = options.previous;

          // Loop through associations and alert as necessary
          _.each(this.associations, function(association) {

            var ReferencedModel;

            // If it's a to-one association, and it wasn't falsy, alert
            // the reverse side
            if (association.type == 'model' && [association.alias] && previous[association.alias]) {
              ReferencedModel = sails.models[association.model];
              // Get the inverse association definition, if any
              reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity}) || _.find(ReferencedModel.associations, {model: this.identity});

              if (reverseAssociation) {
                // If it's a to-one, publish a simple update alert
                var referencedModelId = _.isObject(previous[association.alias]) ? previous[association.alias][ReferencedModel.primaryKey] : previous[association.alias];
                if (reverseAssociation.type == 'model') {
                  var pubData = {};
                  pubData[reverseAssociation.alias] = null;
                  ReferencedModel.publishUpdate(referencedModelId, pubData, {noReverse:true});
                }
                // If it's a to-many, publish a "removed" alert
                else {
                  ReferencedModel.publishRemove(referencedModelId, reverseAssociation.alias, id, req, {noReverse:true});
                }
              }
            }

            else if (association.type == 'collection' && previous[association.alias].length) {
              ReferencedModel = sails.models[association.collection];
              // Get the inverse association definition, if any
              reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity}) || _.find(ReferencedModel.associations, {model: this.identity});

              if (reverseAssociation) {
                _.each(previous[association.alias], function(associatedModel) {
                  // If it's a to-one, publish a simple update alert
                  if (reverseAssociation.type == 'model') {
                    var pubData = {};
                    pubData[reverseAssociation.alias] = null;
                    ReferencedModel.publishUpdate(associatedModel[ReferencedModel.primaryKey], pubData, req, {noReverse:true});
                  }
                  // If it's a to-many, publish a "removed" alert
                  else {
                    ReferencedModel.publishRemove(associatedModel[ReferencedModel.primaryKey], reverseAssociation.alias, id, req, {noReverse:true});
                  }
                });
              }
            }

          }, this);

        }

        if (sails.util.isFunction(this.afterPublishDestroy)) {
          this.afterPublishDestroy(id, req, options);
        }

      },


      /**
       * publishAdd
       *
       * @param  {[type]} id           [description]
       * @param  {[type]} alias        [description]
       * @param  {[type]} idAdded      [description]
       * @param  {[type]} socketToOmit [description]
       */

      publishAdd: function(id, alias, idAdded, req, options) {

        // Make sure there's an options object
        options = options || {};

        // Enforce valid usage
        var invalidId = !id || _.isObject(id);
        var invalidAlias = !alias || !_.isString(alias);
        var invalidAddedId = !idAdded || _.isObject(idAdded);
        if ( invalidId || invalidAlias || invalidAddedId ) {
          return sails.log.error(
            'Invalid usage of ' + this.identity +
            '`publishAdd(id, alias, idAdded, [socketToOmit])`'
          );
        }

        if (sails.util.isFunction(this.beforePublishAdd)) {
          this.beforePublishAdd(id, alias, idAdded, req);
        }

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);


        // In development environment, blast out a message to everyone
        sails.sockets.publishToFirehose({
          id: id,
          model: this.identity,
          verb: 'addedTo',
          attribute: alias,
          addedId: idAdded
        });

        this.publish(id, this.identity, 'add:'+alias, {
          id: id,
          verb: 'addedTo',
          attribute: alias,
          addedId: idAdded
        }, socketToOmit);

        if (!options.noReverse) {

          // Get the reverse association
          var reverseModel = sails.models[_.find(this.associations, {alias: alias}).collection];

          var data;

          // Subscribe to the model you're adding
          if (req) {
            data = {};
            data[reverseModel.primaryKey] = idAdded;
            reverseModel.subscribe(req, data);
          }

          // Find the reverse association, if any
          var reverseAssociation = _.find(reverseModel.associations, {alias: _.find(this.associations, {alias: alias}).via}) ;
          if (reverseAssociation) {
            // If this is a many-to-many association, do a publishAdd for the
            // other side.
            if (reverseAssociation.type == 'collection') {
              reverseModel.publishAdd(idAdded, reverseAssociation.alias, id, req, {noReverse:true});
            }

            // Otherwise, do a publishUpdate
            else {
              data = {};
              data[reverseAssociation.alias] = id;
              reverseModel.publishUpdate(idAdded, data, req, {noReverse:true});
            }
          }

        }


        if (sails.util.isFunction(this.afterPublishAdd)) {
          this.afterPublishAdd(id, alias, idAdded, req);
        }

      },


      /**
       * publishRemove
       *
       * @param  {[type]} id           [description]
       * @param  {[type]} alias        [description]
       * @param  {[type]} idRemoved    [description]
       * @param  {[type]} socketToOmit [description]
       */

      publishRemove: function(id, alias, idRemoved, req, options) {

        // Make sure there's an options object
        options = options || {};

        // Enforce valid usage
        var invalidId = !id || _.isObject(id);
        var invalidAlias = !alias || !_.isString(alias);
        var invalidRemovedId = !idRemoved || _.isObject(idRemoved);
        if ( invalidId || invalidAlias || invalidRemovedId ) {
          return sails.log.error(
            'Invalid usage of ' + this.identity +
            '`publishRemove(id, alias, idRemoved, [socketToOmit])`'
          );
        }
        if (sails.util.isFunction(this.beforePublishRemove)) {
          this.beforePublishRemove(id, alias, idRemoved, req);
        }

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // In development environment, blast out a message to everyone
        sails.sockets.publishToFirehose({
          id: id,
          model: this.identity,
          verb: 'removedFrom',
          attribute: alias,
          removedId: idRemoved
        });

        this.publish(id, this.identity, 'remove:' + alias, {
          id: id,
          verb: 'removedFrom',
          attribute: alias,
          removedId: idRemoved
        }, socketToOmit);


        if (!options.noReverse) {

          // Get the reverse association, if any
          var reverseModel = sails.models[_.find(this.associations, {alias: alias}).collection];
          var reverseAssociation = _.find(reverseModel.associations, {alias: _.find(this.associations, {alias: alias}).via});

          if (reverseAssociation) {
            // If this is a many-to-many association, do a publishAdd for the
            // other side.
            if (reverseAssociation.type == 'collection') {
              reverseModel.publishRemove(idRemoved, reverseAssociation.alias, id, req, {noReverse:true});
            }

            // Otherwise, do a publishUpdate
            else {
              var data = {};
              data[reverseAssociation.alias] = null;
              reverseModel.publishUpdate(idRemoved, data, req, {noReverse:true});
            }
          }

        }

        if (sails.util.isFunction(this.afterPublishRemove)) {
          this.afterPublishRemove(id, alias, idRemoved, req);
        }

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

      publishCreate: function(values, req, options) {
        var self = this;

        options = options || {};

        if (!values[this.primaryKey]) {
          return sails.log.error(
            'Invalid usage of publishCreate() :: ' +
            'Values must have an `'+this.primaryKey+'`, instead got ::\n' +
            util.inspect(values)
          );
        }

        if (sails.util.isFunction(this.beforePublishCreate)) {
          this.beforePublishCreate(values, req);
        }

        var id = values[this.primaryKey];

        // If any of the added values were association attributes, publish add or remove messages.
        _.each(values, function(val, key) {

          // If the user hasn't yet given this association a value, bail out
          if (val === null) {
            return;
          }

          var association = _.find(this.associations, {alias: key});

          // If the attribute isn't an assoctiation, return
          if (!association) return;

          // Get the associated model class
          var ReferencedModel = sails.models[association.type == 'model' ? association.model : association.collection];

          // Bail if the model doesn't exist
          if (!ReferencedModel) return;

          // Bail if this attribute isn't in the model's schema
          if (association.type == 'model') {

            // Get the inverse association definition, if any
            reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, via: key});

              if (!reverseAssociation) {return;}

              // If this is a to-many association, do publishAdd on the other side
              // TODO -- support nested creates.  For now, we can't tell if an object value here represents
              // a NEW object or an existing one, so we'll ignore it.
              if (reverseAssociation.type == 'collection' && !_.isObject(val)) {
                  ReferencedModel.publishAdd(val, reverseAssociation.alias, id, {noReverse:true});
              }
              // Otherwise do a publishUpdate
              // TODO -- support nested creates.  For now, we can't tell if an object value here represents
              // a NEW object or an existing one, so we'll ignore it.
              else {

                var pubData = {};

                if (!_.isObject(val)) {
                  pubData[reverseAssociation.alias] = id;
                  ReferencedModel.publishUpdate(val, pubData, req, {noReverse:true});
                }

              }

          }

          else {

            // Get the inverse association definition, if any
            reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity, via: key}) || _.find(ReferencedModel.associations, {model: this.identity, alias: association.via});

              if (!reverseAssociation) {return;}

              // If this is a to-many association, do publishAdds on the other side
              if (reverseAssociation.type == 'collection') {

                // Alert any added models
                _.each(val, function(pk) {
                  // TODO -- support nested creates.  For now, we can't tell if an object value here represents
                  // a NEW object or an existing one, so we'll ignore it.
                  if (_.isObject(pk)) return;
                  ReferencedModel.publishAdd(pk, reverseAssociation.alias, id, {noReverse:true});
                });

              }

              // Otherwise do a publishUpdate
              else {

                // Alert any added models
                _.each(val, function(pk) {
                  // TODO -- support nested creates.  For now, we can't tell if an object value here represents
                  // a NEW object or an existing one, so we'll ignore it.
                  if (_.isObject(pk)) return;
                  var pubData = {};
                  pubData[reverseAssociation.alias] = id;
                  ReferencedModel.publishUpdate(pk, pubData, req, {noReverse:true});
                });

              }

            }

        }, this);

        // Ensure that we're working with a plain object
        values = _.clone(values);

        // If a request object was sent, get its socket, otherwise assume a socket was sent.
        var socketToOmit = (req && req.socket ? req.socket : req);

        // Blast success message
        sails.sockets.publishToFirehose({

          model: this.identity,
          verb: 'create',
          data: values,
          id: values[this.primaryKey]

        });

        // Publish to classroom
        var eventName = this.identity;
        this.broadcast(this._classRoom(), eventName, {
          verb: 'created',
          data: values,
          id: values[this.primaryKey]
        }, socketToOmit);

        // Also broadcasts a message to the legacy class room (derived by
        // using the `:legacy_v0.9` trailer on the class room name).
        // Uses traditional eventName === "message".
        // Uses traditional message format.
        if (sails.config.sockets['backwardsCompatibilityFor0.9SocketClients']) {
          var legacyData = _.cloneDeep({
            verb: 'create',
            data: values,
            model: self.identity,
            id: values[this.primaryKey]
          });
          var legacyRoom = this._classRoom()+':legacy_v0.9';
          self.broadcast( legacyRoom, 'message', legacyData, socketToOmit );
        }

        // Subscribe watchers to the new instance
        if (!options.noIntroduce) {
          this.introduce(values[this.primaryKey]);
        }

        if (sails.util.isFunction(this.afterPublishCreate)) {
          this.afterPublishCreate(values, req);
        }

      },


      /**
       *
       * @return {[type]} [description]
       */
      watch: function ( req ) {

        var socket = req.socket ? req.socket : req;

        if (!socket.manager) {
          return sails.log.warn('`Model.watch()` called by a non-socket request. Only requests originating from a connected socket may be subscribed. Ignoring...');
        }

        sails.sockets.join(socket, this._classRoom());
        sails.log.silly("Subscribed socket ", sails.sockets.id(socket), "to", this._classRoom());

        if (sails.config.sockets['backwardsCompatibilityFor0.9SocketClients'] && socket.handshake) {
          var sdk = getSDKMetadata(socket.handshake);
          var isLegacySocketClient = sdk.version === '0.9.0';
          if (isLegacySocketClient) {
            sails.sockets.join(socket, this._classRoom()+':legacy_v0.9');
          }
        }

      },

      /**
       * [unwatch description]
       * @param  {[type]} socket [description]
       * @return {[type]}        [description]
       */
      unwatch: function ( req ) {

        var socket = req.socket ? req.socket : req;

        if (!socket.manager) {
          return sails.log.warn('`Model.unwatch()` called by a non-socket request. Only requests originating from a connected socket may be subscribed. Ignoring...');
        }

        sails.sockets.leave(socket, this._classRoom());
        sails.log.silly("Unubscribed socket ", sails.sockets.id(socket), "from", this._classRoom());

        if (sails.config.sockets['backwardsCompatibilityFor0.9SocketClients'] && socket.handshake) {
          var sdk = getSDKMetadata(socket.handshake);
          var isLegacySocketClient = sdk.version === '0.9.0';
          if (isLegacySocketClient) {
            sails.sockets.leave(socket, this._classRoom()+':legacy_v0.9');
          }
        }
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

      introduce: function(model) {

        var id = model[this.primaryKey] || model;

        _.each(this.watchers(), function(socket) {
          this.subscribe(socket, id);
        }, this);

      },

      /**
       * Bid farewell to a destroyed instance
       * Take all of the socket subscribers in this instance room
       * and unsubscribe them from it
       */
      retire: function(model) {

        var id = model[this.primaryKey] || model;

        _.each(this.subscribers(id), function(socket) {
          this.unsubscribe(socket, id);
        }, this);

      }

    };
  }

};
