_.extend(exports,ExampleController = {
	

	index: function (req, res, next ) {
		// Render view
		res.render('example', {
			title: 'example'
		});

	},

	summary: function (req, res, next ) {
		res.render('example', {
			title: 'example/summary'
		});
	},



	detail: function (req, res, next ) {
		res.render('example', {
			title: 'example/detail'
		});
	}
});


function error (response) {
	return {
		success: false,
		error: (_.isString(response)) ? {
			message: response
		} : response
	};
}

function success (response) {
	return _.extend({
		success: true
	}, response);
}

