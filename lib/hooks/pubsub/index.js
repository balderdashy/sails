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


		//////////////////////////////////////////////////////
		// 
		// TODO: 
		// Drop notion of "class" room for subscriptions.
		// Instead, every built-in room is an instance room:
		//
		// Team.findOne(id).exec(function(err,team){
		// 	req.subscribe(team, function cb(err) {
		// 		/* ... */
		//	});
		// });
		//
		//
		// TODO: 
		// Consider moving publishing into a built-in Socket.io
		// adapter-- this allows it to be enabled per-model.
		// Also-- simplify lower-level publish methods, and 
		// normalize their usage to the conventions found in 
		// Waterline, i.e. enable `.exec()` instead of `cb`:
		//
		// Team.publish(7, message, cb)
		//		-> send message to all sockets in room #7
		//
		// Team.unsubscribeAll(7, cb)
		//		-> unsubscribe all sockets from Team #7
		//
		// Team.members(7, cb)
		//		-> get sockets subscribed to Team #7
		//
		// Team.subscribe(7, 92395, cb)
		//		-> subscribe socket #92395 to Team #7
		//		-> analagous to req.subscribe(team7,cb)
		//			(if req.socket.id === #92395)
		//
		// Team.unsubscribe(7, 92395, cb)
		//		-> unsubscribe socket #92395 from Team #7
		//		-> analagous to req.unsubscribe(team7,cb)
		//
		//////////////////////////////////////////////////////

		dependencies: ['sockets', 'orm'],

		loadAfter: 'orm',

		initialize: function(cb) {

			var self = this;

			// Do the heavy lifting
			self.augmentModels();

			// Indicate that the hook is fully loaded
			cb();

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
			* Introduce a new instance 
			*
			* (1)	Take all of the subscribers to the class room and 'introduce' them 
			*		to a new instance room
			*/

			introduce: function (id, socketToOmit) {
				var self = this;
				sails.log.verbose("Introduced model "+self.room(id));
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
			*/

			retire: function (id, socketToOmit) {
				var self = this;
				sails.log.verbose("Bid farewell to model " + self.room(id));
				_.each( this.subscribers(id) ,function (socket) {

					if (socketToOmit && socketToOmit.id === socket.id) {
						return;
					}
					
					socket.leave( self.room(id) );
				});
			},



			/**
			* Broadcast a message to sockets connected to the specified models
			* (or null to broadcast to the entire class room)
			*
			* @param {Socket} socketToOmit - if specified, broadcast using this 
			* socket (effectively omitting it)
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

			// Return the room name for an instance in this collection with the given id
			room: function (id) {
				if (!id) return this.classRoom();
				return 'sails_c_'+this.identity+'_'+id;
			},

			classRoom: function () {
				return 'sails_c_create_'+this.identity;
			},

			// Return the set of sockets subscribed to this instance or class room
			subscribers: function (id) {
				var room = id ? this.room(id) : this.classRoom();
				return sails.io.sockets.clients(room);
			},


			/**
			 * Publish the creation of a model
			 *
			 * @param {Object} values
			 *		- the data to publish
			 *
			 * @param {Socket} socketToOmit (optional)
			 *		- if specified, socket will omitted from boradcast (uses socket.broadcast)
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
			 * Publish an update on a particular model
			 *
			 * @param {String|Finite} id
			 *		- primary key of the instance we're referring to
			 *
			 * @param {Object} changes
			 *		- changes to this instance that will be broadcasted
			 *
			 * @param {Socket} socketToOmit (optional)
			 *		- if specified, socket will omitted from boradcast (uses socket.broadcast)
			 */

			publishUpdate: function (id, changes, socketToOmit) {

				// Ensure that we're working with a plain object
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

				// sails.log.verbose(
				// 	'publishUpdate :: to ' + this.globalId + ' with id=' + id + '\t' +
				// 	'(room :: ' + this.room(id) + ')'+ '\n' + 
				// 	'Changes :: ' + util.inspect(changes) + '\n'
				// );
			},

			/** 
			 * Publish the destruction of a particular model
			 *
			 * @param {String|Finite} id
			 *		- primary key of the instance we're referring to
			 *
			 * @param {Socket} socketToOmit (optional)
			 *		- if specified, socket will omitted from boradcast (uses socket.broadcast)
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
			*
			* e.g.
			*		// Subscribe to User.create()
			*		User.subscribe(req.socket)
			*
			*		// Subscribe to User.update() and User.destroy() 
			*		// for the specified instances (or user.save() / user.destroy())
			*		User.subscribe(req.socket, users)
			*/

			subscribe: function (socket, models) {

				// Legacy support for v0.8 (used to accept `req`, not `socket`)
				if (socket.isSocket && socket.socket && socket.param) {
					socket = socket.socket;
				}

				// If this is not a socket.io socket, subscribe always fails silently
				if (! (socket && socket.manager) ) return;
				
				var self = this;

				// Subscribe to class room to hear about new models
				if (!models) {
					socket.join( self.classRoom() );
					sails.log.verbose(
						'Subscribed to create events (and model introductions) for ' + 
						self.globalId + '\t' + '(room :: ' + self.classRoom() + ')'
					);
					return;
				}

				// Subscribe to model instances
				models = self.pluralize(models);
				var ids = _.pluck(models,'id');

				_.each(ids,function (id) {
					sails.log.verbose(
						'Subscribed to updates and destroy event for ' + 
						self.globalId + ' with id=' + id + '\t(room :: ' + self.room(id) + ')'
					);
					socket.join( self.room(id) );
				});
			},




			/**
			 * Unsubscribe a socket from some models
			 * NOTE:
				This method will be deprecated in an upcoming release.
				Subscriptions should be called from the request object
				or socket themselves, not from the model.
			 */

			unsubscribe: function (socket, models) {

				// Legacy support for v0.8 (used to accept `req`, not `socket`)
				if (socket.isSocket && socket.socket && socket.param) {
					socket = socket.socket;
				}

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
			}
		};
	}

};
