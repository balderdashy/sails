var TableView = Backbone.View.extend({
//	el: '.ui-list-wrapper',
	
	// Children must specify the following properties:
//	collectionClass: CollectionClassName,
//	rowClass: RowViewClassName,
	
	// Sorting options can be overriden like so:
//	sortField: "dateModified",
//	sortOrder: 'desc',
	
	
	events: {
		'click .loadMore':'clickLoadMore'
	},
	
	filters: {
		searchFilter: ''
	},
	
	emptyContainerClass: 'empty-collection',
	
	// Start on page 0, user can activate LoadMore to get more pages
	page: 0,
	
	// How many models to load at a time
	perPage: 5,
	

	emptyText: "No data available.",
	
	noneFoundText: "No matches found.",
	
	initialize: function () {
		_.bindAll(this);
		$(this.domReady);
		
		this.collection = new this.collectionClass;
		this.selectedViews = [];
		this.wrapperEl = "div.ui-list-wrapper";
		this.el = this.wrapperEl;
		this.tableEl = "div.ui-list";
		this.containerEl = "div.ui-list ul";
	},

	// Fired when document is ready
	domReady: function () {
		this.el = $(this.el);

		// Empty table and load messages from server
		$(this.containerEl).empty();
		this.loadData();
		
		// Assign a keyup event that watches the search filter for google-like keyup search
		this.searchBar = $(this.wrapperEl).find('.ui-list-search')
		this.searchBar.live('keyup',this.userTypedInSearchBar);
	},
	
	
	// Triggered every time user presses a key in the search bar
	userTypedInSearchBar: function (e) {
		
		// TODO: Ignore key presses that don't matter, to reduce # of requests
		
		// Use timer to reduce # of requests
		this.keyupTimer && window.clearTimeout(this.keyupTimer);
		this.keyupTimer = window.setTimeout(this.filterBySearch, 200);
	},
	
	
	// Apply the user search filter
	filterBySearch: function (){

		// Reset page
		this.page = 0;

		// Filter table
		var query = this.searchBar.val();
		if (query.length > 0) {

			// Fetch filtered results
			this.page = 0;
			this.filters.searchFilter = query;
			this.loadData();
		}
		else {
			this.filters.searchFilter = "";
			this.loadData();
		}
	},
	
	
	// Template and return dynamic HTML
	generateHTML: function () {
		var data = {
			hasMore: this.collection.hasMore ? this.markup.loadMoreButton : ""
		}
		var template = _.template(this.markup.root),
			html = template(data);
		return html;
	},

	
	// Override to return a filter of some kind to the fetch request
	filter: function () {
		return null;
	},


	// Do fresh load of messages from server
	loadData: function () {

		// Start loading
		if (this.collection.url) {
			
			this.collection.fetch({
				add: this.page > 0,
				data: {
//					filter: this.filter(),	// arbitrary filter-- defined by inheritors
					
					// Built-in filtering
					filter: (this.filters && this.filters.searchFilter) || "",
					labelFilters: (this.filters && this.filters.labelFilters) || [],
					
					// Pagination
					page: this.page,
					max: this.perPage,
					offset: this.page*this.perPage,
					
					sort: this.sortField,
					order: this.sortOrder
				},
				processData:true,
				success: this.finishedLoading
			});

			if (this.page == 0) {
				// empty table and display loading spinner onload
//				$(this.tableEl).hide();
				$('<div class="'+this.emptyContainerClass+'"><img class="loader" src="/images/ajax-loader-small.gif"/></div>').appendTo(this.wrapperEl).center();
			}
			else {
			// If this is a "load more" request, display the inline spinner
				var loadMoreButton = this.el.find(".loadMore");
				loadMoreButton.text('');
				$('<div class="'+this.emptyContainerClass+'"><img class="loader" src="/images/ajax-loader-small.gif"/></div>').appendTo(loadMoreButton).center();
			}
		}
		else {
			throw new Error("Trying to load data from server, but no collection CRUD url provided!");
		}
	},

	// Messages loaded from server successfully via ajax
	finishedLoading: function (collection,response) {
		var me = this;
		me.render();

		window.clearTimeout(this.spinTimer);
		var spinn = $(this.wrapperEl).children('.'+this.emptyContainerClass);


		// Finished loading, remove spinner
		if (spinn.length > 0) {
//			$(this.tableEl).fadeIn(350);
			$("."+this.emptyContainerClass).fadeOut(150,function () {
				$(this).remove();
			});
		} else {
			$("."+this.emptyContainerClass).hide();
			$(this.tableEl).show();
		}
	},
	
	
	// User clicked loadMore button
	clickLoadMore: function () {
		this.page++;
		this.loadData();
	},
	
	// Return whether any filters have been attached
	anyFilters: function () {
		return this.filters && (
				(typeof tagsView != "undefined" && tagsView.filters && tagsView.filters.length > 0) || 
				(this.filters.searchFilter && this.filters.searchFilter.length > 0)
			);
	},

	// Render the table ==> update the DOM
	// If node is specified, don't refresh everything
	render: function (node) {
		var me = this;		
		var view = null;
		
		// Additive
		if (node) {
			// Generate view for new node
			view = new me.rowClass({
				model: node,
				containerEl: me.containerEl,
				collectionView: me
			});
			view.render({
				prepend:true
			});
		}
		// Paged render (additive)
		else if (this.page > 0) {
			for (var index = this.perPage*this.page; index < this.perPage*(this.page+1); index++) {
				if (this.collection.at(index)) {
					new me.rowClass({
						model: this.collection.at(index),
						containerEl: me.containerEl,
						collectionView: me
					}).render();
				}
				else 
					break;
			}
		}	
		// Complete reset
		else {
			$(this.containerEl).empty();
			$(this.wrapperEl).find('.emptytext').remove();
			if (this.collection.length == 0) {
				var msg;
				if (this.anyFilters()) {
					msg = this.noneFoundText;
				}
				else {
					msg = this.emptyText;
				}
				
				$("<div class='emptytext'>" + msg + "</div>").appendTo(this.wrapperEl)
			}
			else {
				this.collection.each(function(a) {
					new me.rowClass({
						model: a,
						containerEl: me.containerEl,
						collectionView: me
					}).render();
				});
			}
		}
	
		
		// Display/hide "Load More..." button if necessary
		this.el.find('.loadMore').remove();
		$(this.generateHTML()).appendTo(this.wrapperEl);

		this.delegateEvents();
		
		return view;
	},
	
	
	markup: {
		root:"<%= hasMore %>",
		loadMoreButton:"<a class='loadMore ui-button ui-theme-gray'>more</a>"
	}
});