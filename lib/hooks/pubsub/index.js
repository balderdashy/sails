/**
 * Module dependencies.
 */
var util = require('util')
	, _ = require('lodash')
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

				var AugmentedModel = _.defaults(sails.models[identity], getPubsubMethods() );
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
		 * @param  {func}   cb       Optional callback
		 */
		sails.sockets.join = function(socket, roomName, cb) {

			// If a string was sent, try to look up a socket with that ID
			if (typeof socket == 'string') {socket = sails.io.sockets.socket(socket);}

			// If it's not a valid socket object, bail
			if (! (socket && socket.manager) ) return false;

			// Join up!
			cb ? socket.join(roomName, cb) : socket.join(roomName);

			return true;
		};

		/**
		 * Unsubscribe a socket from a generic room
		 * @param  {object} socket   The socket to unsubscribe.
		 * @param  {string} roomName The room to unsubscribe from
		 * @param  {func}   cb       Optional callback
		 */
		sails.sockets.leave = function(socket, roomName, cb) {

			// If a string was sent, try to look up a socket with that ID
			if (typeof socket == 'string') {socket = sails.io.sockets.socket(socket);}

			// If it's not a valid socket object, bail
			if (! (socket && socket.manager) ) return false;

			// See ya!
			cb ? socket.leave(roomName, cb) : socket.leave(roomName);

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
		 * Thus, sails.sockets.broadcast(data) is also a valid usage.
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
		 * Get the list of IDs of sockets subscribed to a room
		 * @param  {string} roomName The room to get subscribers of
		 * @return {array} An array of socket instances
		 */
		sails.sockets.subscribers = function(roomName) {
			return _.pluck(sails.io.sockets.clients(roomName), 'id');
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
			 * @param {Object|String|Finite} model -- model or ID of model whose subscribers should receive the message
			 * @param {Object|Array|String|Finite} message -- the message payload
			 * @param {Request|Socket} req - if specified, broadcast using this 
			 * socket (effectively omitting it)
			 *
			 */

			message: function(model, message, req) {

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = (req && req.socket ? req.socket : req);

				// If no models provided, throw an error
				if (!model) {
					throw new Error('Must specify a model or model ID when calling `Model.publish`');
				}

				// Otherwise publish to each instance room
				else {

					// Get the model ID (if the model argument isn't already a scalar)
					var id = model.id || model;
					// Get the socket room to publish to
					var room = this.room(id, "message");
					// Create the payload
					var data = {
						verb: "messaged",
						id: id,
						data: message
					};

					sails.sockets.broadcast( room, this.identity, data, socketToOmit );
					sails.log.silly("Published message to ", room, ": ", message);
				
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
					sails.log.warn('`Model.publish` should specify a context; using "message".  Try `Model.message` instead?');
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
					sails.sockets.broadcast( self.classRoom(), eventName, data, socketToOmit );
					return;
				}

				// Otherwise publish to each instance room
				else {
					models = this.pluralize(models);
					var ids = _.pluck(models,'id');
					if ( ids.length === 0 ) {
						sails.log.warn('Can\'t publish a message to an empty list of instances-- ignoring...');
					}
					_.each(ids,function eachInstance (id) {
						var room = self.room(id, context);
						sails.log.silly("Published ", eventName, " to ", room);
						sails.sockets.broadcast( room, eventName, data, socketToOmit );
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
				return _.map(models, function (model) {
					if ( _.isString(model) || _.isFinite(model) ) {
						var id = model;
						return { id: id };
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
				if (!id) throw new Error('Must specify an `id` when calling `Model.room(id)`');
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
			 * @return {Array[String]}
			 * @synchronous
			 * @api private
			 */
			subscribers: function (id, context) {
				return sails.sockets.subscribers(this.room(id, context));
			},

			/**
			 * Return the set of sockets subscribed to this class room
			 * @return {Array[String]}
			 * @synchronous
			 * @api private
			 */
			watchers: function() {
				return sails.sockets.subscribers(this._classRoom());
			},

			/**
			* Subscribe a socket to a handful of models in this collection
			*
			* Usage:
			* Model.subscribe(req,socket [, models] )
			*
			* @param {Request|Socket} req - request containing the socket to subscribe, or the socket itself
			* @param {Object|Array|String|Finite} models - id, array of ids, model, or array of models
			*
			* e.g.
			*		// Subscribe to User.create()
			*		User.subscribe(req.socket)
			*
			*		// Subscribe to User.update() and User.destroy() 
			*		// for the specified instances (or user.save() / user.destroy())
			*		User.subscribe(req.socket, users)
			*
			* @api public
			*/

			subscribe: function (req, models, contexts) {

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socket = req.socket ? req.socket : req;

				var self = this;

				// Subscribe to class room to hear about new models
				if (!models) {
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

				// Subscribe to model instances
				models = self.pluralize(models);
				var ids = _.pluck(models,'id');

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
			 * Unsubscribe a socket from some models
			 *
			 * @param {Request|Socket} req - request containing the socket to unsubscribe, or the socket itself
			 * @param {Object|Array|String|Finite} models - id, array of ids, model, or array of models
			 */

			unsubscribe: function (req, models, contexts) {

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socket = req.socket ? req.socket : req;

				var self = this;
				
				// If no models provided, unsubscribe from the class room
				if (!models) {
					STRINGFILE.logDeprecationNotice(
						'Model.unsubscribe(socket, null, ...)',
							STRINGFILE.get('links.docs.sockets.pubsub'),
							sails.log.debug) &&
					STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

					this.watch();

				}

				contexts = contexts || this.getAllContexts();

				if (contexts === true) {
					contexts = this.getAllContexts();
				}
				
				models = self.pluralize(models);
				var ids = _.pluck(models,'id');
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
			 *		- primary key of the instance we're referring to
			 *
			 * @param {Object} changes
			 *		- an object of changes to this instance that will be broadcasted
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
					throw new Error(
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

						var attributes = this.attributes || {};
						var referencedModel = attributes[key] && attributes[key].model;
						
						// Bail if this attribute isn't in the model's schema
						if (referencedModel) {
							// Get the associated model class
							var ReferencedModel = sails.models[referencedModel];
							// Get the inverse association definition, if any
							reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity}) || _.find(ReferencedModel.associations, {model: this.identity});

							// If this is a to-many association, do publishAdd or publishRemove as necessary
							// on the other side
							if (reverseAssociation.type == 'collection') {
								if (previous[key]) {
									ReferencedModel.publishRemove(previous[key], reverseAssociation.alias, id, {noReverse:true});
								}
								if (val) {
									ReferencedModel.publishAdd(val, reverseAssociation.alias, id, {noReverse:true});
								} 
							}

						}
					}, this);
				}

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = (req && req.socket ? req.socket : req);

				// In development environment, blast out a message to everyone
				if (sails.config.environment == 'development') {
					sails.sockets.publishToFirehose(data);
				}

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
			 *		- primary key of the instance we're referring to
			 *
			 * @param {Request|Socket} req - if specified, broadcast using this socket (effectively omitting it)
			 *
			 */

			publishDestroy: function (id, req, options) {

				options = options || {};

				// Enforce valid usage
				var invalidId = !id || _.isObject(id);
				if ( invalidId ) {
					throw new Error(
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
				if (sails.config.environment == 'development') {
					sails.sockets.publishToFirehose(data);
				}

				data.verb = 'destroyed';
				delete data.model;

				// Broadcast to the model instance room
				this.publish(id, this.identity, 'destroy', data, socketToOmit);

				// Retire the model instance
				this.retire(id);

				if (options.previous) {

					var previous = options.previous;

					// Loop through associations and alert as necessary
					_.each(this.associations, function(association) {

						// If it's a to-one association, and it wasn't falsy, alert
						// the reverse side
						if (association.type == 'model' && [association.alias]) {
							var ReferencedModel = sails.models[association.model];
							// Get the inverse association definition, if any
							reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity}) || _.find(ReferencedModel.associations, {model: this.identity});
							if (!reverseAssociation) return;
							// If it's a to-one, publish a simple update alert
							if (reverseAssociation.type == 'model') {
								var pubData = {};
								pubData[reverseAssociation.alias] = null;
								ReferencedModel.publishUpdate(previous[association.alias].id, pubData, {noReverse:true});
							} 
							// If it's a to-many, publish a "removed" alert
							else {
								ReferencedModel.publishRemove(previous[association.alias].id, reverseAssociation.alias, id, req, {noReverse:true});
							}
						}
						
						else if (association.type == 'collection' && previous[association.alias].length) {
							var ReferencedModel = sails.models[association.collection];
							// Get the inverse association definition, if any
							reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity}) || _.find(ReferencedModel.associations, {model: this.identity});
							_.each(previous[association.alias], function(associatedModel) {
								// If it's a to-one, publish a simple update alert
								if (reverseAssociation.type == 'model') {
									var pubData = {};
									pubData[reverseAssociation.alias] = null;
									ReferencedModel.publishUpdate(associatedModel.id, pubData, req, {noReverse:true});
								} 
								// If it's a to-many, publish a "removed" alert
								else {
									ReferencedModel.publishRemove(associatedModel.id, reverseAssociation.alias, id, req, {noReverse:true});
								}
							});
						}

					});				

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
					throw new Error(
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
				if (sails.config.environment == 'development') {
					sails.sockets.publishToFirehose({
						id: id,
						model: this.identity,
						verb: 'addedTo',
						attribute: alias,
						addedId: idAdded
					});
				}

				this.publish(id, this.identity, 'add:'+alias, {
					id: id,
					verb: 'addedTo',
					attribute: alias,
					addedId: idAdded
				}, socketToOmit);

				if (!options.noReverse) {

					// Get the reverse association
					var reverseModel = sails.models[_.find(this.associations, {alias: alias}).collection];

					// Subscribe to the model you're adding
					if (req) {
						reverseModel.subscribe(req, {id:idAdded});
					}

					var reverseAssociation = _.find(reverseModel.associations, {collection: this.identity}) || _.find(reverseModel.associations, {model: this.identity});

					if (reverseAssociation) {
						// If this is a many-to-many association, do a publishAdd for the 
						// other side.
						if (reverseAssociation.type == 'collection') {
							reverseModel.publishAdd(idAdded, reverseAssociation.alias, id, req, {noReverse:true});
						}

						// Otherwise, do a publishUpdate
						else {
							var data = {};
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
					throw new Error(
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
				if (sails.config.environment == 'development') {
					sails.sockets.publishToFirehose({
						id: id,
						model: this.identity,
						verb: 'removedFrom',
						attribute: alias,
						removedId: idRemoved
					});
				}

				this.publish(id, this.identity, 'remove:' + alias, {
					id: id,
					verb: 'removedFrom',
					attribute: alias,
					removedId: idRemoved
				}, socketToOmit);


				if (!options.noReverse) {

					// Get the reverse association
					var reverseModel = sails.models[_.find(this.associations, {alias: alias}).collection];
					var reverseAssociation = _.find(reverseModel.associations, {collection: this.identity}) || _.find(reverseModel.associations, {model: this.identity});

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

			publishCreate: function(values, req) {

				if (!values.id) {
					throw new Error(
						'Invalid usage of publishCreate() :: ' +
						'Values must have an `id`, instead got ::\n' +
						util.inspect(values)
					);
				}

				if (sails.util.isFunction(this.beforePublishCreate)) {
					this.beforePublishCreate(values, req);
				}

				// If any of the added values were association attributes, publish add or remove messages.
				_.each(values, function(val, key) {
					
					var attributes = this.attributes || {};
					var referencedModel = attributes[key] && attributes[key].model;
					
					// Bail if this attribute isn't in the model's schema
					if (referencedModel) {
						// Get the associated model class
						var ReferencedModel = sails.models[referencedModel];
						// Get the inverse association definition, if any
						reverseAssociation = _.find(ReferencedModel.associations, {collection: this.identity}) || _.find(ReferencedModel.associations, {model: this.identity});

						// If this is a many-to-many association, do a publishAdd for the 
						// other side.
						if (reverseAssociation.type == 'collection') {
							ReferencedModel.publishAdd(val, reverseAssociation.alias, values.id, req, {noReverse:true});
						}

						// Otherwise, do a publishUpdate
						else {
							var pubData = {};
							pubData[reverseAssociation.alias] = values.id;
							ReferencedModel.publishUpdate(val, pubData, req, {noReverse:true});
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
					id: values.id

				});

				// Publish to classroom
				sails.sockets.broadcast(this._classRoom(), this.identity, {
					verb: 'created',
					data: values,
					id: values.id
				}, socketToOmit);

				// Introduce to classroom
				this.introduce(values.id);

				if (sails.util.isFunction(this.afterPublishCreate)) {
					this.afterPublishCreate(values, req);
				}

			},


			/**
			 * 
			 * @return {[type]} [description]
			 */
			watch: function ( socket ) {

				sails.sockets.join(socket, this._classRoom());

			},

			/**
			 * [unwatch description]
			 * @param  {[type]} socket [description]
			 * @return {[type]}        [description]
			 */
			unwatch: function ( socket ) {

				sails.sockets.leave(socket, this._classRoom());

			},


			/**
			 * Introduce a new instance
			 *
			 * Take all of the subscribers to the class room and 'introduce' them
			 * to a new instance room
			 *
			 * @param {String|Finite} id
			 *		- primary key of the instance we're referring to
			 *		
			 * @api private
			 */

			introduce: function(id) {

				_.each(this.watchers(), function(socketId) {
					this.subscribe(socketId, id);
				}, this);

			},

			/**
			 * Bid farewell to a destroyed instance
			 * Take all of the socket subscribers in this instance room
			 * and unsubscribe them from it
			 */
			retire: function(id) {

				_.each(this.subscribers(id), function(socket) {
					this.unsubscribe(socket, id);
				});
			
			}

		};
	}

};
