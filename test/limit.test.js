describe('limit', function() {
	it('normal usage should not break', function(cb) {
		User.find({
			where: {
				type: 'limit test'
			},
			limit: 10
		}, cb);
	});

	it('dynamic finder usage should not break', function(cb) {
		User.findByType('limit test', {
			limit: 10
		}, cb);
	});

	it('secondary usage should not break', function(cb) {
		User.find({
			where: {
				type: 'limit test'
			}
		}, {
			limit: 10
		}, cb);
	});


});