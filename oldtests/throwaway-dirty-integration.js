var _ = require('underscore');
var adapter = require('../adapters/DirtyAdapter.js');

//////////////////////////////////////////
// Extremely bad test harness!
//////////////////////////////////////////
// mock sails
sails = {
	config: {
		waterline: {
			createdAt: true,
			updatedAt: true
		}
	}
};

// Do some things
adapter.connect(function afterConnect(err) {
	if(err) throw err;

	// Sync mocked models with datasource
	adapter.sync({
		Message: {
			name: 'STRING'
		}
	}, function afterSync(err) {
		if(err) throw err;

		// Get collection from adapter
		adapter.describe('Message', function afterDescribeMessage(err, description) {
			if(err) throw err;
			// TODO: Validate that this worked
			console.log("Message schema:",description);
		});

		// Find by id
		adapter.create('Message',{
			name: 'Mike'
		},function (err, message) {
			adapter.update('Message',1, {
				name: 'Jerry'
			}, function (err,message) {
				adapter.find('Message', 1, function(err, message) {
					console.log("Message #1:", message);
				});

				adapter.destroy('Message', 1, function(err, message) {
					console.log("Message #1 destroyed:", message);
					adapter.find('Message', 1, function(err, message) {
						console.log("Message #1:", message);
					});
				});
			});
		});

	});
});