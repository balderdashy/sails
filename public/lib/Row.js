var Row = Backbone.Model.extend({
	initialize: function(attrs) {
		// Cast fields that must be integers
		attrs.id = +attrs.id;
		this.id = attrs.id;

		this.body = attrs;
		this.attributes = attrs;
	},
	defaults: {
	},
	rules: {
}
})