var Content = Row.extend({

	initialize: function(params) {
		
		// Cast fields that must be integers
		params.id = +params.id;
		this.id = params.id;
		
		this.attributes = _.extend(this.attributes,params);
	},


	defaults: {},


	rules: {}
})