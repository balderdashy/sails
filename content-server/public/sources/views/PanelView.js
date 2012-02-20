var PanelView = Backbone.View.extend({
	el: 'body',
	events: {
		'change #navbar-dropdown':'onSelectNav',
		'click a.create-node':'onClickCreateNode'
	},
	
	onSelectNav: function (e) {
		var destination = $(e.currentTarget).find("option:selected").attr('href');
		window.location = destination;
	},
	
	onClickCreateNode: function (e) {		
		var emptyNode = new Content({
			type: 'text',
			payload: ''
		});
		contentsView.collection.add(emptyNode);
		contentsView.render(emptyNode);
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