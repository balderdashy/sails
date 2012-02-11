var Contents = Rows.extend({

	url: '/content/fetch',
	
	model: Content,
	
	initialize: function () {
		_.bindAll(this);
	}

})