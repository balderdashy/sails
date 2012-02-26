var ContentsView = TableView.extend({
	el: '.content-node-list',
	
	perPage: 10,
	
	// Parse message id from URL for filtering the fetch
	filter: function () {
		return this.message_id
	},
	
	emptyText: 'No content nodes exist.',
	
	collectionClass: Contents,
	rowClass:ContentView,
	
	
	deleteAllSelected: function (callback) {
		var me = this;
		var selectedModels = _.pluck(this.selectedViews, 'model');
		
		// TODO: Prevent delete if these models are already pending deletion or don't exist
		
//		// Remove selected models
//		this.collection.remove(selectedModels,{
//			success:function(model,response) {
//				console.log("SUCCESS",response);
//			},
//			error: function (model,response) {
//				console.log("ERROR",response);
//				
//			}
//		});
		
		// Mark selected nodes as busy
		_.each(this.selectedViews,function(selectedView) {
			selectedView.busyfy();
		},this);
		
		// Issue delete all request to server
		// TODO: extrapolate this to the model
		var selectedModelIds = _.pluck(selectedModels, 'id');
		
		// Empty list of selected views
		this.selectedViews = [];
		
		// TODO: talk to server with as small a JSON request as possible
		$.post('/node/deleteAll',{
			models: selectedModelIds
		},function (response) {
			Log.log(response);
			
			// remove selected models from collection
			me.collection.remove(selectedModels);
			
			// Rerender collection
			// TODO: Do this more elegantly
			me.page = 0;
			me.loadData();
			callback && callback();
		});
		
		
	}
});

// Initialize
var contentsView;
contentsView = new ContentsView();