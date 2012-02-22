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
			title: _.uniqueId('Unsaved Node ')
		});
		contentsView.collection.add(emptyNode);
		contentsView.render(emptyNode);	
	},
	
	
	
	initialize: function(options) {
		_.bindAll(this);
		$(this.ready);
	},
	ready: function() {
		this.el = $("body");
		this.render();
	},
	render: function() {
		if (contentsView.selected.length > 0) {
			$("a.delete-nodes").show();
		}
		else {
			$("a.delete-nodes").hide();
		}
		this.delegateEvents();
	}
});
manageContentView = new PanelView;