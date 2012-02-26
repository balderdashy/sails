var PanelView = Backbone.View.extend({
	el: 'body',
	events: {
		'change #navbar-dropdown':'onSelectNav',
		'click a.create-node':'onClickCreateNode',
		'click a.delete-nodes':'onClickDeleteNodes'
	},
	
	onSelectNav: function (e) {
		var destination = $(e.currentTarget).find("option:selected").attr('href');
		window.location = destination;
	},
	
	onClickCreateNode: function (e) {		
		var emptyNode = new Content({
			type: 'text'
			, title: _.uniqueId('Unsaved Node ')
		});
		contentsView.collection.add(emptyNode,{
			at: 0
		});
		
		
		// TODO: DONT SAVE THE NODE UNTIL THE USER HITS ENTER
		// AND ITS BEEN VALIDATED
		
		
//		emptyNode.save({},{
//			success: function (model,response) {
//				Log.log(model);
				var emptyView = contentsView.render(emptyNode);	
				emptyView.openEditor('title');
//				$(emptyView.el).find('.editor.title').select();
//			},
//			error: function (model,response) {
//				Log.log("ERROR",response);
//			}
//		});
	},
	
	onClickDeleteNodes: function (e) {
		var me = this;
		contentsView.deleteAllSelected(function () {
			me.render();
		});
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
		if (contentsView) {
			if (contentsView.selectedViews.length > 0) {
				$("a.delete-nodes").show();
			}
			else {
				$("a.delete-nodes").hide();
			}
		}
		this.delegateEvents();
	}
});
manageContentView = new PanelView;