/**
 * Module dependencies.
 */
var util = require('util');
var _ = require('lodash');


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
					'introduce',
					'retire',
					'unsubscribe',
					'publish',
					'room',
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

		/**
		 * Subscribe a socket to a generic room
		 * @param  {object} socket   The socket to subscribe, or a request object.
		 * @param  {string} roomName The room to subscribe to
		 */
		sails.sockets.join = function(socket, roomName) {
			if (socket.socket) {socket = socket.socket;}
			socket.join(roomName);
		}

		/**
		 * Unsubscribe a socket from a generic room
		 * @param  {object} socket   The socket to unsubscribe, or a request object.
		 * @param  {string} roomName The room to unsubscribe from
		 */
		sails.sockets.leave = function(socket, roomName) {
			if (socket.socket) {socket = socket.socket;}
			socket.leave(roomName);
		}

		/**
		 * Broadcast a message to a room
		 *
		 * If the event name is omitted, "message" will be used by default.
		 * Thus, sails.sockets.broadcast(roomName, data) is also a valid usage.
		 *
		 * @param  {string} roomName The room to broadcast a message to
		 * @param  {string} event 	 The event name to broadcast
		 * @param  {object} data	 The data to broadcast
		 * @param  {object} socket 	 Optional socket to omit, or a request object
		 */
		sails.sockets.broadcast = function(roomName, event, data, socket) {
			if (typeof event === "object") {
				data = event;
				event = null;
			}
			if (!event) {
				event = 'message';
			}
			if (socket) {
				if (socket.socket) {socket = socket.socket;}
				socket.broadcast.to(roomName).emit(event, data);
			} else {
				sails.io.sockets.in(roomName).emit(event, data);
			}
		}

		/**
		 * Get the ID of a socket object
		 * @param  {object} socket The socket object to get the ID of
		 * @return {string}        The socket's ID
		 */
		sails.sockets.id = function(socket) {
			if (socket.socket) {socket = socket.socket;}
			return socket.id;
		}

		/**
		 * Emit a message to one or more sockets
		 * 
		 * If the event name is omitted, "message" will be used by default.
		 * Thus, sails.sockets.emit(socketIDs, data) is also a valid usage.
		 * 		 
		 * @param  {array|string} socketIDs The ID or IDs of sockets to send a message to
		 * @param  {string} event     The name of the message to send
		 * @param  {object} data      Optional data to send with the message
		 */
		sails.sockets.emit = function(socketIDs, event, data) {
			if (!_.isArray(socketIDs)) {
				socketIDs = [socketIDs];
			}

			if (typeof event === "object") {
				data = event;
				event = null;
			}
			
			if (!event) {
				event = 'message';
			}

			_.each(socketIDs, function(socketID) {
				sails.io.sockets.socket(socketID).emit(event, data);
			});
		}

		/**
		 * Get the list of IDs of sockets subscribed to a room
		 * @param  {string} roomName The room to get subscribers of
		 * @return {array} An array of socket instances
		 */
		sails.sockets.subscribers = function(roomName) {
			return _.pluck(sails.io.sockets.clients(roomName), 'id');
		}

		/**
		 * Get the list of rooms a socket is subscribed to
		 * @param  {object} socket The socket to get rooms for, or a request object
		 * @return {array} An array of room names
		 */
		sails.sockets.socketRooms = function(socket) {
			if (socket.socket) {socket = socket.socket;}
			return _.map(_.keys(sails.io.sockets.manager.roomClients[socket.id]), function(roomName) {return roomName.replace(/^\//,'');});
		}

		/**
		 * Get the list of all rooms
		 * @return {array} An array of room names
		 */
		sails.sockets.rooms = function() {
			return sails.io.sockets.manager.rooms
		}

	}

	/**
	 * These methods get appended to the Model class objects
	 * Some take req.socket as an argument to get access
	 * to user('s|s') socket object(s)
	 */

	function getPubsubMethods () {

		return {

			
			/**
			 * Broadcast a message to sockets connected to the specified models
			 * (or null to broadcast to the entire class room)
			 *
			 * @param {Socket} socketToOmit - if specified, broadcast using this 
			 * socket (effectively omitting it)
			 *
			 * @api private
			 */

			publish: function (models, message, data, socketToOmit) {
				var self = this;

				if (typeof message === 'object') {
					socketToOmit = data;
					data = message;
					message = null;
				}

				if (!message) {
					message = 'message';
				}

				// If no models provided, publish to the class room
				if (!models) {
					sails.log.warn('Calling publish without models is deprecated; use custom rooms instead.');
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
						var room = self.room(id);
						sails.log.silly("Published ", message, " to ", room);
						sails.sockets.broadcast( room, message, data, socketToOmit );
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
			room: function (id) {
				if (!id) throw new Error('Must specify an `id` when calling `Moel.room(id)`');
				return 'sails_model_'+this.identity+'_'+id;
			},

			/**
			 * @return {String} name of this model's global class room
			 * @synchronous
			 * @api private
			 */
			classRoom: function () {
				sails.log.warn('classRoom is deprecated; use custom rooms instead.');
				return 'sails_model_create_'+this.identity;
			},

			/**
			 * Return the set of sockets subscribed to this instance or class room
			 * @param  {String|Integer} id
			 * @return {Array[String]}
			 * @synchronous
			 * @api private
			 */
			subscribers: function (id) {
				var room = id ? this.room(id) : this.classRoom();
				return sails.sockets.subscribers(room);
			},

			/**
			* Subscribe a socket to a handful of models in this collection
			*
			* Usage:
			* Model.subscribe(req,socket [, models] )
			*
			* @param {Socket} socket - the socket to subscribe
			* @param {Object|Array|String|Finite} models - id, array of ids, model, or array of models
			* @param {Function} cb - optional callback
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

			subscribe: function (socket, models) {

				if (socket.socket) {socket = socket.socket;}

				// If this is not a socket.io Socket, subscribe 
				if (! (socket && socket.manager) ) return;
				
				var self = this;

				// Subscribe to class room to hear about new models
				if (!models) {
					sails.log.warn(
						'Calling subscribe without models is deprecated; create a custom room instead using sails.sockets.join.'
					);
					return;
				}

				// Subscribe to model instances
				models = self.pluralize(models);
				var ids = _.pluck(models,'id');

				_.each(ids,function (id) {
					sails.log.silly(
						'Subscribed to the ' + 
						self.globalId + ' with id=' + id + '\t(room :: ' + self.room(id) + ')'
					);
					sails.sockets.join( socket, self.room(id) );
				});
			},

			/**
			 * Unsubscribe a socket from some models
			 *
			 * @api private
			 */

			unsubscribe: function (socket, models) {

				if (socket.socket) {socket = socket.socket;}

				// If this is not a socket.io socket, unsubscribe always fails silently
				if (! (socket && socket.manager) ) return;

				var self = this;
				
				// If no models provided, unsubscribe from the class room
				if (!models) {
					sails.log.warn(
						'Calling unsubscribe without models is deprecated; use custom rooms instead.'
					);
					return;
				}
				
				models = self.pluralize(models);
				var ids = _.pluck(models,'id');
				_.each(ids,function (id) {
					sails.log.silly(
						'Unsubscribed from the ' + 
						self.globalId + ' with id=' + id + '\t(room :: ' + self.room(id) + ')'
					);					
					sails.sockets.leave( socket, self.room(id) );
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
			 * @param {Function} cb - optional callback
			 * 
			 * @api public
			 */

			publishUpdate: function (id, changes, socketToOmit) {

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

				var data = {
					model: this.identity,
					verb: 'update',
					data: changes,
					id: id					
				};

				// Old-style comet message; this may be phased out in future releases.
				this.publish(id, data, socketToOmit);

				data.verb = 'updated';
				delete data.model;

				// Broadcast to the model room
				this.publish(id, this.identity, data, socketToOmit);

			},

			/** 
			 * Publish the destruction of a particular model
			 *
			 * @param {String|Finite} id
			 *		- primary key of the instance we're referring to
			 *
			 * @param {Function} cb - optional callback
			 *
			 * @api public
			 */

			publishDestroy: function (id, socketToOmit) {

				// Enforce valid usage
				var invalidId = !id || _.isObject(id);
				if ( invalidId ) {
					throw new Error(
						'Invalid usage of ' + this.identity + 
						'`publishDestroy(id, [socketToOmit])`'
					);
				}

				var data = {
					model: this.identity,
					verb: 'destroy',
					id: id					
				};

				// Old-style comet message; this may be phased out in future releases.
				this.publish(id, data, socketToOmit);

				data.verb = 'destroyed';
				delete data.model;

				// Broadcast to the model room
				this.publish(id, this.identity, data, socketToOmit);

			},

			publishAdd: function(id, alias, idAdded, socketToOmit) {

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

				this.publish(id, this.identity, {
					id: id,
					verb: 'addedTo',
					attribute: alias,
					addedId: idAdded
				}, socketToOmit);

			},

			publishRemove: function(id, alias, idRemoved, socketToOmit) {

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

				this.publish(id, this.identity, {
					id: id,
					verb: 'removedFrom',
					attribute: alias,
					removedId: idRemoved
				}, socketToOmit);
				
			},

			introduce: function (id) {
				sails.log.warn("introduce is deprecated; use custom rooms instead");
				return;	
			},

			retire: function (id) {
				sails.log.warn("retire is deprecated; use custom rooms instead");
				return;	
			}

		};
	}

};
