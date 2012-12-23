var _ = require('underscore');
_.str = require('underscore.string');

var pubsub = {
	/**
	* Subscribe to a handful of models in this collection
	*/
	subscribe: function (req, models) {
		if (!req.isSocket) return;
		var my = this;

		// Subscribe to class room to hear about new models
		req.socket.join( my.classRoom() );
		sails.log.verbose("SUBSCRIBED TO "+my.classRoom());

		// Subscribe to existing models
		var ids = _.pluck(models,'id');
		_.each(ids,function (id) {
			sails.log.verbose("SUBSCRIBED TO "+my.room(id));
			req.socket.join( my.room(id) );
		});

	},

	/**
	* Unsubscribe from some models
	*/
	unsubscribe: function (req,models) {
		if (!req.isSocket) return;
		var my = this;

		// If no models provided, unsubscribe from the class room
		if (!models) req.socket.leave( my.classRoom() );
		else {
			var ids = _.pluck(models,'id');
			_.each(ids,function (id) {
				req.socket.leave( my.room(id) );
			});
		}
	},

	/**
	* Broadcast a message to sockets connected to the specified models
	*/
	publish: function (req,models,message) {
		if (!req.isSocket) return;
		var my = this;

		// If no models provided, publish to the class room
		if (!models) {
			req.socket.broadcast.to( my.classRoom() ).json.send(message);
			sails.log.verbose("PUBLISHED TO "+my.classRoom());
			sails.log.verbose("MESSAGE:",message);
		}
		// Otherwise publish to each instance room
		else {
			var ids = _.pluck(models,'id');
			_.each(ids,function (id) {
				req.socket.broadcast.to( my.room(id) ).json.send(message);
				sails.log.verbose("PUBLISHED TO "+my.room(id));
				sails.log.verbose("MESSAGE:",message);
			});
		}
	},

	// Return the room name for an instance in this collection with the given id
	room: function (id) {
		return 'sails_c_'+this.identity+'_'+id;
	},

	classRoom: function () {
		return 'sails_c_create_'+this.identity;
	}
};

// Include broadcast as a convenience synonym for publish
pubsub.broadcast = pubsub.publish;

// Export logic
module.exports = pubsub;