var PanelView = Backbone.View.extend({
	el: 'body',
	events: {
		'change #navbar-dropdown':'onSelectNav'
	},
	
	onSelectNav: function (e) {
		var destination = $(e.currentTarget).find("option:selected").attr('href');
		window.location = destination;
	},
	
	
	
	initialize: function(options) {
		_.bindAll(this);
		$(this.render);
	},
	render: function() {
		this.el = $("body");
		this.delegateEvents();
	}
});
new PanelView;