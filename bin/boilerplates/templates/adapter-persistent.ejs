/*---------------------
	:: <%- entity %> 
	-> persistent adapter
---------------------*/
var adapter = {

	// Keep track of reusable connections through this adapter
	persistentConnections: {},

	// This method runs when a model is registered
	registerCollection: function (collection, cb) {
		locateOrEstablishConnection(collection, cb);
	},

	// Establish and repsond w/ a persistent connection instance
	connect: function (collection, cb) {
		
		// TODO: connection logic
		var persistentConnection = {};

		// Respond w/ persistent connection
		cb(null, persistentConncetion);
	},


	// Use an existing connection if possible, otherwise create a new one
	locateOrEstablishConnection: function (collection, cb) {
		var self = this;

		// Maintain as few simultaneous connections as possible by looking at uniqueness characteristics
		// (e.g. if this is MySQL, is the hostname, username, password, and database the same?)
		var uniqueCharacteristics = [
		// 'foo',
		// 'bar'
		];

		// If a suitably similar persistent connection to this adapter already exists, use it
		var found = _.find(this.persistentConnections, function (link) {

			// Put similarity criteria here
			return _.isEqual(link, collection);
		});

		// Existing persistent connection found
		// and accesible as this.persistentConnections[collection.identity]
		if (found) {
			this.persistentConnections[collection.identity] = found;
			cb();
		}

		// Otherwise, set up the persistent connection, 
		// then create an artifact of this connection in case it can be reused
		// Inside, stow the identifying characteristics, as well as the live connection object
		else {

			// Set up the persistent connection through the adapter
			this.connect(collection, function (err, connection) {
				if (err) return cb(err);

				// Track reference to actual connection object
				var link = {
					_connection: connection
				};

				// Keep track of other identifying properties so they can be looked at
				_.each(uniqueCharacteristics, function (characteristic) {
					link[characteristic] = collection[characteristic];
				});

				// Save persistent connection and get out
				self.persistentConnections[collection.identity] = link;
				cb();
			});
		}
	}
};

_.bindAll(adapter);
module.exports = adapter;