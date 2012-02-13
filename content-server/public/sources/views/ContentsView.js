var ContentsView = TableView.extend({
	el: '.content-node-list',
	
	perPage: 10,
	
	// Parse message id from URL for filtering the fetch
	filter: function () {
		return this.message_id
	},
	
	emptyText: 'No content nodes exist.',
	
	collectionClass: Contents,
	rowClass:ContentView
});

// Initialize
var contentsView;
contentsView = new ContentsView();