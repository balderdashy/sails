before(function (done) {
	require('sails').lift({
		port: 99999,
		adapters: {
			default: 'myLocalMySQLTestDatabase' // should be defined in config/local.js
		}
	}, done);
});


after(function (done) {
	sails.lower(done);
});
