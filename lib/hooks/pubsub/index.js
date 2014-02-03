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
		 * @param  {string} event    The event name to broadcast
		 * @param  {object} data     The data to broadcast
		 * @param  {object} socket   Optional socket to omit
		 */
		
		sails.sockets.broadcast = function(roomName, event, data, socketToOmit) {

			// If the 'event' is an object, assume the argument was omitted and
			// parse it as data instead.
			if (typeof event === "object") {
				data = event;
				event = null;
			}

			// Default to the 'message' event.
			if (!event) {
				event = 'message';
			}

			// If we were given a valid socket to omit, broadcast from there.
			if (socketToOmit && socketToOmit.manager) {
				socketToOmit.broadcast.to(roomName).emit(event, data);
			} 
			// Otherwise broadcast to everyone
			else {
				sails.io.sockets.in(roomName).emit(event, data);
			}
		};

		/**
		 * Broadcast a message to all connected sockets
		 *
		 * If the event name is omitted, "message" will be used by default.
		 * Thus, sails.sockets.broadcast(data) is also a valid usage.
		 *
		 * @param  {string} event    The event name to broadcast
		 * @param  {object} data     The data to broadcast
		 * @param  {object} socket   Optional socket to omit
		 */
		
		sails.sockets.blast = function(event, data, socketToOmit) {
		
			// If the 'event' is an object, assume the argument was omitted and
			// parse it as data instead.
			if (typeof event === "object") {
				data = event;
				event = null;
			}

			// Default to the 'message' event.
			if (!event) {
				event = 'message';
			}

			// If we were given a valid socket to omit, broadcast from there.
			if (socketToOmit && socketToOmit.manager) {
				socketToOmit.broadcast.emit(event, data);
			} 

			// Otherwise broadcast to everyone
			else {
				sails.io.sockets.emit(event, data);
			}		
		}

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
			return _.without(sails.io.sockets.manager.rooms, "");
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
			 * Broadcast a message to sockets connected to the specified models
			 * (or null to broadcast to the entire class room)
			 *
			 * @param {Request|Socket} req - if specified, broadcast using this 
			 * socket (effectively omitting it)
			 *
			 * @api private
			 */

			publish: function (models, message, data, req) {
				var self = this;

				if (typeof message === 'object') {
					req = data;
					data = message;
					message = null;
				}

				if (!message) {
					message = 'message';
				}

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = !sails.config.blueprints.mirror && (req && req.socket ? req.socket : req);

				// If no models provided, publish to the class room
				if (!models) {
					STRINGFILE.logDeprecationNotice(
						'Model.publish(null, ...)',
							STRINGFILE.get('links.docs.sockets.pubsub'),
							sails.log.debug) && 
					STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

					sails.log.silly("Published ", message, " to ", self.classRoom());
					sails.sockets.broadcast( self.classRoom(), message, data, socketToOmit );
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
				STRINGFILE.logDeprecationNotice(
					'Model.classRoom',
						STRINGFILE.get('links.docs.sockets.pubsub'),
						sails.log.debug) && 
				STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

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
			* @param {Request|Socket} req - request containing the socket to subscribe, or the socket itself
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

			subscribe: function (req, models, cb) {

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

					cb ? sails.sockets.join(socket, self.classRoom(), cb) : sails.sockets.join(socket, self.classRoom());
					sails.log.silly(
						'Subscribed to create events (and model introductions) for ' +
						self.globalId + '\t' + '(room :: ' + self.classRoom() + ')'
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
					if (cb) {
						sails.sockets.join( socket, self.room(id), cb );
					}
					else sails.sockets.join( socket, self.room(id) );
				});
			},

			/**
			 * Unsubscribe a socket from some models
			 *
			 * @param {Request|Socket} req - request containing the socket to unsubscribe, or the socket itself
			 * @param {Object|Array|String|Finite} models - id, array of ids, model, or array of models
			 * @param {Function} cb - optional callback
			 */

			unsubscribe: function (req, models, cb) {

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

					return cb ?
						sails.sockets.leave( socket, self.classRoom(), cb )
						: sails.sockets.leave( socket, self.classRoom());
				}
				
				models = self.pluralize(models);
				var ids = _.pluck(models,'id');
				_.each(ids,function (id) {
					sails.log.silly(
						'Unsubscribed from the ' + 
						self.globalId + ' with id=' + id + '\t(room :: ' + self.room(id) + ')'
					);
					cb ? 
					sails.sockets.leave( socket, self.room(id), cb )
					: sails.sockets.leave( socket, self.room(id));
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

			publishUpdate: function (id, changes, req) {

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

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = !sails.config.blueprints.mirror && (req && req.socket ? req.socket : req);

				// In development environment, blast out a message to everyone
				if (sails.config.environment == 'development') {
					sails.sockets.blast('debug', data, socketToOmit);
				}

				data.verb = 'updated';
				delete data.model;

				// Broadcast to the model instance room
				this.publish(id, this.identity, data, socketToOmit);

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

			publishDestroy: function (id, req) {

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

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = !sails.config.blueprints.mirror && (req && req.socket ? req.socket : req);

				// In development environment, blast out a message to everyone
				if (sails.config.environment == 'development') {
					sails.sockets.blast('debug', data, socketToOmit);
				}

				data.verb = 'destroyed';
				delete data.model;

				// Broadcast to the model room
				this.publish(id, this.identity, data, socketToOmit);

			},


			/**
			 * publishAdd
			 * 
			 * @param  {[type]} id           [description]
			 * @param  {[type]} alias        [description]
			 * @param  {[type]} idAdded      [description]
			 * @param  {[type]} socketToOmit [description]
			 */

			publishAdd: function(id, alias, idAdded, req) {

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

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = !sails.config.blueprints.mirror && (req && req.socket ? req.socket : req);


				// In development environment, blast out a message to everyone
				if (sails.config.environment == 'development') {
					sails.sockets.blast('debug', {
						id: id,
						model: this.identity,
						verb: 'addedTo',
						attribute: alias,
						addedId: idAdded
					}, socketToOmit);
				}

				this.publish(id, {
					id: id,
					verb: 'addedTo',
					attribute: alias,
					addedId: idAdded
				}, socketToOmit);

			},


			/**
			 * publishRemove
			 * 
			 * @param  {[type]} id           [description]
			 * @param  {[type]} alias        [description]
			 * @param  {[type]} idRemoved    [description]
			 * @param  {[type]} socketToOmit [description]
			 */

			publishRemove: function(id, alias, idRemoved, req) {

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

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = !sails.config.blueprints.mirror && (req && req.socket ? req.socket : req);

				// In development environment, blast out a message to everyone
				if (sails.config.environment == 'development') {
					sails.sockets.blast('debug', {
						id: id,
						model: this.identity,
						verb: 'removedFrom',
						attribute: alias,
						removedId: idRemoved
					}, socketToOmit);
				}

				this.publish(id, {
					id: id,
					verb: 'removedFrom',
					attribute: alias,
					removedId: idRemoved
				}, socketToOmit);
				
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

				// Only do this in development environment by default
				if (sails.config.environment != 'development') {
					return;
				}

				// Ensure that we're working with a plain object
				values = _.clone(values);

				if (!values.id) {
					throw new Error(
						'Invalid usage of publishCreate() :: ' +
						'Values must have an `id`, instead got ::\n' +
						util.inspect(values)
					);
				}

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = !sails.config.blueprints.mirror && (req && req.socket ? req.socket : req);

				// Blast success message
				sails.sockets.blast('debug', {

					model: this.identity,
					verb: 'create',
					data: values,
					id: values.id

				}, socketToOmit);

			},


			/**
			 * Introduce a new instance
			 *
			 * (1)        Take all of the subscribers to the class room and 'introduce' them
			 *                to a new instance room
			 *
			 * @param {String|Finite} id
			 *		- primary key of the instance we're referring to
			 *		
			 * @param {Request|Socket} req - if specified, broadcast using this socket (effectively omitting it)
			 *
			 * @api private
			 */

			introduce: function(id, req) {

				STRINGFILE.logDeprecationNotice(
					'Model.introduce',
						STRINGFILE.get('links.docs.sockets.pubsub'),
						sails.log.debug) && 
				STRINGFILE.logUpgradeNotice(STRINGFILE.get('upgrade.classrooms'), [], sails.log.debug);

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				var socketToOmit = !sails.config.blueprints.mirror && (req && req.socket ? req.socket : req);

				var self = this;
				sails.log.silly("Introduced model " + self.room(id));
				_.each(this.subscribers(), function(socketId) {

					if (socketToOmit && socketToOmit.id === socketId) {
						return;
					}

					sails.sockets.join(socketId, self.room(id));
				});
			},



			/**
			 * Bid farewell to a destroyed instance
			 * Take all of the socket subscribers in this instance room
			 * and unsubscribe them from it
			 */

			retire: function(id, socketToOmit) {

				var self = this;
				sails.log.silly("Retired model " + self.room(id));

				// If a request object was sent, get its socket, otherwise assume a socket was sent.
				socketToOmit = req.socket ? req.socket : req;

				_.each(this.subscribers(id), function(socket) {

					if (socketToOmit && socketToOmit.id === socketId) {
						return;
					}

					sails.sockets.leave(socketId, self.room(id));
				});
			}

		};
	}

};
