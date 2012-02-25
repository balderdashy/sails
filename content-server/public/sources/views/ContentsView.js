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
	
	
	deleteAllSelected: function () {
		var selectedModels = _.pluck(this.selectedViews, 'model');
		
		// Remove selected models
		this.collection.remove(selectedModels,{
			success:function(model,response) {
				console.log("SUCCESS",response);
			},
			error: function (model,response) {
				console.log("ERROR",response);
				
			}
		});
		
		// Mark selected nodes as busy
		this.selected.each(function(selectedModel) {
			
		});
		
		
		// Delete models from serverside
		
		
		
			// Empty "selected" collection (might happen anyways)


			// Reload view		
			this.loadData();
	}
});

// Initialize
var contentsView;
contentsView = new ContentsView();