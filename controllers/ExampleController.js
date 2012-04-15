_.extend(exports,ExampleController = {
	

	index: function (req, res, next ) {
		var accountDetail;
	
		Account.build({
			username: 'blah',
			password: 'password'
		}).save().
			success(function successCallback(savedModel) {
			//		console.log("Model saved to DB.",savedModel);
			accountDetail = success({
				id: savedModel.id,
				title: savedModel.title
			});
		
			// Render view
			res.render('example', {
				title: 'example',
				account: accountDetail
			});
		}).
			error(function errorCallback(response) {
			debug.error("Error.  Could not save model to DB.",response);
			res.json(error(response));
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

