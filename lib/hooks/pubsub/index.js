module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */


	var util = require('../../util');


	/**
	 * Expose Hook definition
	 */

	return {

		initialize: function(cb) {

			// If `views` and `http` hook is not enabled, complain and respond w/ error
			if (!sails.hooks.sockets) {
				return cb(new Error('Cannot use `pubsub` hook without the `sockets` hook enabled!'));
			}

			// Augment models with room/socket logic (& bind context)
			for (var identity in sails.models) {
				sails.models[identity] = util.defaults(sails.models[identity], pubsub() );
				util.bindAll(sails.models[identity], 'subscribe', 'introduce', 'unsubscribe', 'publish', 'room', 'publishCreate', 'publishUpdate', 'publishDestroy');
			}

			cb();
		}
	};

	/**
	 * These methods get appended to the Model class objects
	 * They take in the request object as an argument in order to 
	 * get access to the user's socket
	 */

	function pubsub () {

		return {

			/**
			* Introduce a new instance 
			*
			* (1)	Take all of the subscribers to the class room and 'introduce' them 
			*		to a new instance room
			*/

			introduce: function (id, socketToOmit) {
				var my = this;
				sails.log.verbose("Introduced model "+my.room(id));
				util.each(this.subscribers(),function (socket) {

					if (socketToOmit && socketToOmit.id === socket.id) {
						return;
					}

					socket.join( my.room(id) );
				});
			},



			/**
			* Bid farewell to a destroyed instance 
			* Take all of the socket subscribers in this instance room 
			* and unsubscribe them from it
			*/

			obituary: function (id, socketToOmit) {
				var my = this;
				sails.log.verbose("Bid farewell to model " + my.room(id));
				util.each( this.subscribers(id) ,function (socket) {

					if (socketToOmit && socketToOmit.id === socket.id) {
						return;
					}
					
					socket.leave( my.room(id) );
				});
			},



			/**
			* Broadcast a message to sockets connected to the specified models
			* (or null to broadcast to the entire class room)
			*
			* @param {Socket} socket - if specified, broadcast using this 
			* socket (effectively omitting it)
			*/

			publish: function (models, message, socket) {
				var my = this;

				// If no models provided, publish to the class room
				if (!models) {

					sails.log.verbose("Published "+message+" to "+my.classRoom());
					if (socket) {
						try {
							socket.broadcast.to( my.classRoom() ).json.send(message);
							return;
						}
						catch (e) {}
					}
					sails.io.sockets['in']( my.classRoom() ).json.send(message);
				}
				// Otherwise publish to each instance room
				else {
					models = this.pluralize(models);
					var ids = util.pluck(models,'id');

					if ( ids.length === 0 ) {
						sails.log.warn('Can\'t publish a message to an empty list of instances-- ignoring...');
					}

					util.each(ids,function eachInstance (id) {

						sails.log.verbose("Published "+message+" to "+my.room(id));
						if (socket && socket.broadcast) {
							socket.broadcast.to( my.classRoom() ).json.send(message);
							return;
						}
						sails.io.sockets['in']( my.room(id) ).json.send(message);
					});
				}
			},

			// Check that models are a list, if not, make them a list
			pluralize: function (models) {
				
				// If `models` is a non-array object, 
				// turn it into a single-item array ("pluralize" it)
				if (!util.isArray(models)) {
					var model = models;
					models = [model];
				}

				return _.map(models, function (model) {

					// Convert id into simple object
					if ( !util.isDictionary(model) ) {
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
			 * @param {Socket} socketToOmit - if specified, broadcast using this socket 
			 *							(effectively omitting it)
			 */

			publishCreate: function (values, socketToOmit) {

				// Enforce valid usage
				if ( !util.isPlainObject(values) ) {
					throw new Error(
						'Invalid usage of ' + this.identity + 
						'`publishCreate(values, [socketToOmit])`'
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
				this.introduce(values.id, socketToOmit);

			},


			/**
			 * Publish an update on a particular model
			 *
			 * @param {Socket} socket - if specified, broadcast using this socket 
			 *							(effectively omitting it)
			 */

			publishUpdate: function (id, values, socketToOmit) {

				// Enforce valid usage
				var invalidId = !id || util.isObject(id);
				if ( invalidId || !util.isPlainObject(values) ) {
					throw new Error(
						'Invalid usage of ' + this.identity + 
						'`publishUpdate(id, values, [socketToOmit])`'
					);
				}

				this.publish([{
					id: id
				}], {

					model: this.identity,
					verb: 'update',
					data: values,
					id: id

				}, socketToOmit);
			},

			/** 
			 * Publish the destruction of a particular model
			 *
			 * @param {Socket} socket - if specified, broadcast using this socket 
			 *							(effectively omitting it)
			 */

			publishDestroy: function (id, socketToOmit) {

				// Enforce valid usage
				var invalidId = !id || util.isObject(id);
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
				this.obituary(id, socketToOmit);
			},



			/**
			* Subscribe a socket to a handful of models in this collection

			* NOTE:
				This method will be deprecated in an upcoming release.
				Subscriptions should be called from the request object
				or socket themselves, not from the model.


			* Usage:
			*
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
				
				var my = this;

				// Subscribe to class room to hear about new models
				if (!models) {
					socket.join( my.classRoom() );
					sails.log.verbose("Subscribed to collection :: "+my.classRoom());
					return;
				}

				// Subscribe to model instances
				models = my.pluralize(models);
				var ids = util.pluck(models,'id');
				util.each(ids,function (id) {
					sails.log.verbose("Subscribed to model :: "+my.room(id));
					socket.join( my.room(id) );
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

				var my = this;
				
				// If no models provided, unsubscribe from the class room
				if (!models) return socket.leave( my.classRoom() );
				
				models = my.pluralize(models);
				var ids = util.pluck(models,'id');
				util.each(ids,function (id) {
					socket.leave( my.room(id) );
				});
			}
		};
	}

};
