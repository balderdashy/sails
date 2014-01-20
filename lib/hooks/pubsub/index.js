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
					'publishCreate',
					'publishUpdate',
					'publishDestroy'
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

			
			/**
			 * Broadcast a message to sockets connected to the specified models
			 * (or null to broadcast to the entire class room)
			 *
			 * @param {Socket} socketToOmit - if specified, broadcast using this 
			 * socket (effectively omitting it)
			 *
			 * @api private
			 */

			publish: function (models, message, socketToOmit) {
				var self = this;

				// If no models provided, publish to the class room
				if (!models) {
					broadcast( self.classRoom() );
				}
				// Otherwise publish to each instance room
				else {
					models = this.pluralize(models);
					var ids = _.pluck(models,'id');
					if ( ids.length === 0 ) {
						sails.log.warn('Can\'t publish a message to an empty list of instances-- ignoring...');
					}
					_.each(ids,function eachInstance (id) {
						broadcast( self.room(id) );
					});
				}

				function broadcast(room) {
					sails.log.silly("Published ", message, " to ", room);
					if (socketToOmit && socketToOmit.broadcast) {
						sails.log.silly('(omitting socket #'+socketToOmit.id+' from broadcast...)');
						try {
							socketToOmit.broadcast.to( room ).json.send(message);
							return;
						}
						catch (e) {}
					}
					sails.io.sockets['in']( room ).json.send(message);
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
				return sails.io.sockets.clients(room);
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
						'`' + this.globalId + '.publishUpdate(id, changes, [socketToOmit])`'
					);
				}

				this.publish([{
					id: id
				}], {

					model: this.identity,
					verb: 'update',
					data: changes,
					id: id

				}, socketToOmit);

				sails.log.silly(
					'publishUpdate :: to ' + this.globalId + ' with id=' + id + '\t' +
					'(room :: ' + this.room(id) + ')'+ '\n' + 
					'Changes :: ' + util.inspect(changes) + '\n'
				);
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
				cb = cb || function optionalCallback(err) {if (err) sails.log.error(err);};

				// Enforce valid usage
				var invalidId = !id || _.isObject(id);
				if ( invalidId ) {
					throw new Error(
						'Invalid usage of ' + this.identity + 
						'`publishDestroy(id, [socketToOmit])`'
					);
				}

				this.publish([{
					id: id
				}], {
					model: this.identity,
					verb: 'destroy',
					id: id
				}, socketToOmit);

				// find the other sockets and unsubscribe them from this instance
				this.retire(id);
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

			subscribe: function (socket, models, cb) {
				cb = cb || function optionalCallback(err) {if (err) sails.log.error(err);};

				// If this is not a socket.io Socket, subscribe 
				if (! (socket && socket.manager) ) return;
				
				var self = this;

				// Subscribe to class room to hear about new models
				if (!models) {
					socket.join( self.classRoom() );
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
					socket.join( self.room(id) );
				});
			},




			/**
			 * Unsubscribe a socket from some models
			 *
			 * @api private
			 */

			unsubscribe: function (socket, models) {

				// If this is not a socket.io socket, unsubscribe always fails silently
				if (! (socket && socket.manager) ) return;

				var self = this;
				
				// If no models provided, unsubscribe from the class room
				if (!models) return socket.leave( self.classRoom() );
				
				models = self.pluralize(models);
				var ids = _.pluck(models,'id');
				_.each(ids,function (id) {
					socket.leave( self.room(id) );
				});
			},




			/**
			 * Publish the creation of a model
			 *
			 * @param {Object} values
			 *		- the data to publish
			 *
			 * @param {Function} cb - optional callback
			 *
			 * @api public
			 */

			publishCreate: function (values, socketToOmit) {

				// Ensure that we're working with a plain object
				values = _.clone(values);

				if ( !values.id ) {
					throw new Error(
						'Invalid usage of publishCreate() :: ' +
						'Values must have an `id`, instead got ::\n' +
						util.inspect(values)
					);
				}

				// Broadcast success message
				this.publish(null, {

					model: this.identity,
					verb: 'create',
					data: values,
					id	: values.id

				}, socketToOmit);

				// Since we just added a new model, we need to subscribe
				// all users currently in the class room to its updates
				this.introduce(values.id);

			},

			
			/**
			* Introduce a new instance 
			*
			* (1)	Take all of the subscribers to the class room and 'introduce' them 
			*		to a new instance room
			*
			* @api private
			*/

			introduce: function (id, socketToOmit) {
				var self = this;
				sails.log.silly("Introduced model "+self.room(id));
				_.each(this.subscribers(),function (socket) {

					if (socketToOmit && socketToOmit.id === socket.id) {
						return;
					}

					socket.join( self.room(id) );
				});
			},



			/**
			* Bid farewell to a destroyed instance 
			* Take all of the socket subscribers in this instance room 
			* and unsubscribe them from it
			*
			* @api private
			*/

			retire: function (id, socketToOmit) {
				var self = this;
				sails.log.silly("Retired model " + self.room(id));
				_.each( this.subscribers(id) ,function (socket) {

					if (socketToOmit && socketToOmit.id === socket.id) {
						return;
					}
					
					socket.leave( self.room(id) );
				});
			},
		};
	}

};
