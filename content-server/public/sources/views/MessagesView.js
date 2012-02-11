/*
 * Unwired Nation, Inc.
 *
 * NOTICE OF LICENSE
 *
 * This source file and any derivative works are 
 * subject to the Quick Start License Agreement that
 * is bundled with this package in the file QS-LICENSE.txt.
 *
 * It is also available through the world-wide-web at this URL:
 * http://unwirednation.com/legal/
 *
 * Copyright 2011, Unwired Nation, Inc.
 * http://unwirednation.com/
 */


var MessagesView = TableView.extend({
	
	emptyText: 'No messages available.',
	
	collectionClass: Messages,
	
	rowClass:MessageView,
	
	
	// Callback from recipient picker
	recipientsPicked: function (newList,deletedRecipients) {
		
		// Send to new list of recipients
		this.sendMessage(newList);
	},


	// Callback from AJAX send
	sendingFinished: function (serverResponse) {

		// Display flash message
		if (serverResponse.success) {
			flashMessage.display("Message sent!");

			// Update message view
			// (if this is the sent messages page)
			if (this.collection.url == '/sentMessage') {

				var message = new Message(serverResponse.message);
				this.collection.add(message);

				message.id = message.get('id');
				new this.rowClass({
					model: message
				}).prepend();
			}
			// otherwise forward to the sent messages page
			else {
				window.location = "sent"
			}
		}
		else
			flashMessage.display("Oops!  There was a problem sending.");

		// Close progress dialog
		$("#sending").dialog('close');
	},
	
	
	// Send a message when user finishes w/ recipient picker
	sendMessage: function (recipients) {

		// Show progress dialog
		$("#sending").dialog('open');

		$.post('/message/ajaxSend', {
			source_id: this.recipientPicker.messageId,
			recipients: JSON.stringify(recipients)
		}, this.sendingFinished);
	},
	
	
	// Fired when document is ready
	domReady: function () {
		
		// Prepare recipient picker
		this.recipientPicker = new RecipientPicker({
			checkedRecipients: null,
			checkedGroups: null,
			buttonLabel: "Send",
			callback: this.recipientsPicked
		});

		// Keep track of what message id the recipient picker is focused on
		this.recipientPicker.messageId = -1;
		
		
		// Call parent function
		TableView.prototype.domReady.call(this);
		
		// Set empty text
		this.isSent = (this.collection.url == '/sentMessage');
		if (this.isSent) {
			this.emptyText = 'No messages have been sent yet.<br/><a href="/compose">Compose your first message!</a>';
		}
		else {
			this.emptyText = 'No templates available.';
		}
	},
	
	
	// Filter by any selected label filters
	filter: function() {
		if (typeof tagsView == "undefined") {
			return null;
		}
		else {
			return tagsView.filters;
		}
	}
});


// Initialize
var messagesView, tagsView;
messagesView = new MessagesView();
tagsView = new TagsView();






//
//var MessagesView = Backbone.View.extend({
//	
//	el: '.table-wrapper',
//	
//	
//	events: {
//		'click .loadMore':'clickLoadMore'
//	},
//	
//	filters: {
//		searchFilter: '',
//		labelFilters: []
//	},
//	
//	noneFoundText: "No matches found.",
//	
//	// Keep track of pending XHR requests so they can be aborted if necessary
//	xhr: {},
//	
//	// Whether the table is doing a modal load
//	loading: false,
//	
//	
//	// Start on page 0
//	// user can activate LoadMore to get more pages
//	page: 0,
//	
//	// How many models to load at a time
//	perPage: 15,
//	
//	initialize: function () {
//		_.bindAll(this);
//		$(this.domReady);
//		var me = this;
//
//		// Prepare recipient picker
//		this.recipientPicker = new RecipientPicker({
//			checkedRecipients: null,
//			checkedGroups: null,
//			buttonLabel: "Send",
//			callback: this.recipientsPicked
//		});
//
//		// Keep track of what message id the recipient picker is focused on
//		this.recipientPicker.messageId = -1;
//
//		this.collection = new Messages;
//		this.el = "div.table-wrapper";
//		this.wrapperEl = "div.table-wrapper";
//		this.tableEl = "table.ui-table";
//		this.containerEl = "table.ui-table tbody";
//	},
//
//	// Fired when document is ready
//	domReady: function () {
//		this.el = $(this.el);
//		var view = this;
//
//		// Set empty text
//		this.isSent = (this.collection.url == '/sentMessage');
//		if (this.isSent) {
//			this.emptyText = 'No messages have been sent yet.<br/><a href="/message/compose">Compose your first message!</a>';
//		}
//		else {
//			this.emptyText = 'No templates available.';
//		}
//		
//		// Initially load messages from server
//		this.loadData();
//
//		
//		// Assign a keyup event that watches the search filter for google-like keyup search
//		$(this.wrapperEl).find('.filter-bar input').live('keyup',function (e) {
//			// Disable any filters
//			tagsView.deselectAllFilters();
//
//			// Use timer to reduce # of requests
//			view.keyupTimer && window.clearTimeout(view.keyupTimer);
//			view.keyupTimer = window.setTimeout(function (){
//				
//				// Reset page
//				view.page = 0;
//				
//				// Filter table
//				var query = $(e.currentTarget).val();
//				if (query.length > 0) {
//
//					// Fetch filtered results
//					view.page = 0;
//					view.filters.searchFilter = query;
//					view.loadData();
//				}
//				else {
//					view.filters.searchFilter = "";
//					view.loadData();
//				}
//			
//			// Old: client side filtering
////			$("table.ui-table tbody tr td.subject").each(function (){
////				if ($(this).text().toLowerCase().indexOf(query.toLowerCase()) == -1) {
////					$(this).parent('tr').hide();
////				}
////				else {
////					$(this).parent('tr').show();
////				}
////			});
//			}, 50);
//		});
//	},
//
//
//	// Do fresh load of messages from server
//	// with optional filters and pagination parameters
//	loadData: function () {
//		
//		// Cancel existing request
//		this.xhr.fetch && this.xhr.fetch.abort();
//		
//		// Start loading
//		if (this.collection.url) {
//
//			this.xhr.fetch = this.collection.fetch({
//				// If this is not the first page, make fetch additive 
//				add: (this.page > 0),
//				data: { 
//					searchFilter: (this.filters && this.filters.searchFilter) || "",
//					labelFilters: (this.filters && this.filters.labelFilters) || [],
//					
//					page: this.page,
//					sort: (this.collection.url == '/sentMessage') ? "dateSent" : "dateModified",
//					order: 'desc',
//					max: this.perPage,
//					offset: this.page*this.perPage
//				},
//				success: this.messagesLoaded
//			});
//
//			if (this.page == 0) {
//				// empty table and display loading spinner onload
////				$(this.containerEl).hide();
////				$(this.containerEl).addClass('disabled');
//				$('<div class="empty-table"><img class="loader" src="/images/ajax-loader.gif"/></div>').appendTo(this.wrapperEl).center();
//			}
//			else {
//				// If this is a "load more" request, display the inline spinner
//				var loadMoreButton = this.el.find(".loadMore");
//				loadMoreButton.text('');
//				$('<img class="loader" src="/images/ajax-loader.gif"/>').appendTo(loadMoreButton).center();
//			}
//		}
//		else {
//			throw new Error("Trying to load data from server, but no collection CRUD url provided!");
//		}
//
//	},
//	
//
//	// Messages loaded from server successfully via ajax
//	messagesLoaded: function (collection,response) {
//		var view = this;
//		this.render();
//		var spinn = $('.empty-table');
//
//
//		// Finished loading, remove spinner
//		if (spinn.length > 0) {
////			$(this.containerEl).fadeIn(300);
////			$(view.containerEl).removeClass('disabled');
//			$(".empty-table").fadeOut(50,function () {
//				$(this).remove();
//				this.blockInteraction = false;
//			});
//		} else {
//			$(".empty-table").hide();
//			$(this.tableEl).show();
//			this.blockInteraction = false;
//		}
//		
//	},
//	
//	// User clicked loadMore button
//	clickLoadMore: function () {
//		this.blockInteraction = true;
//		this.page++;
//		this.loadData();
//	},
//	
//
//	// Callback from recipient picker
//	recipientsPicked: function (newList,deletedRecipients) {
//		
//		// Send to new list of recipients
//		this.sendMessage(newList);
//	},
//
//
//	// Template and return dynamic HTML
//	generateHTML: function () {
//		var data = {
//			hasMore: this.collection.hasMore ? this.markup.loadMoreButton : ""
//		}
//		var template = _.template(this.markup.root),
//			html = template(data);
//		return html;
//	},
//	
//	
//	// Return whether any filters have been attached
//	anyFilters: function () {
//		return this.filters && this.filters.searchFilter && this.filters.searchFilter.length > 0;
//	},
//
//
//	render: function () {
//		
//		// Additive
//		if (this.page > 0) {			
//			for (var index = this.perPage*this.page; index < this.perPage*(this.page+1); index++) {
//				if (this.collection.at(index))
//					this.collection.at(index).view.render();
//				else 
//					break;
//			}
//		}
//		// Complete reset
//		else {
//			$(this.containerEl).empty();
//			$(this.wrapperEl).find('.emptytext').remove();
//			if (this.collection.length == 0) {
//				var msg;
//				if (this.anyFilters()) {
//					msg = this.noneFoundText;
//				}
//				else {
//					msg = this.emptyText;
//				}
//				
//				$("<div class='emptytext'>" + msg + "</div>").appendTo(this.wrapperEl)
//			}
//			else {
//				this.collection.each(function(a) {
//					a.view.render();
//				});
//			}
//		}
//		
//		// Display/hide "Load More..." button if necessary
//		this.el.find('.loadMore').remove();
//		$(this.generateHTML()).appendTo(this.wrapperEl);
//
//		this.delegateEvents();
//	},
//
//
//	// Send a message when user finishes w/ recipient picker
//	sendMessage: function (recipients) {
//
//		// Show progress dialog
//		$("#sending").dialog('open');
//
//		$.post('/message/ajaxSend', {
//			source_id: this.recipientPicker.messageId,
//			recipients: JSON.stringify(recipients)
//		}, this.sendingFinished);
//	},
//
//	// Callback from AJAX send
//	sendingFinished: function (serverResponse) {
//
//		// Display flash message
//		if (serverResponse.success) {
//			flashMessage.display("Message sent!");
//
//			// Update message view
//			// (if this is the sent messages page)
//			if (this.collection.url == '/sentMessage') {
//
//				var message = new Message(serverResponse.message);
//				this.collection.add(message);
//
//				message.id = message.get('id');
//				message.view.prepend();
//			}
//			// otherwise forward to the sent messages page
//			else {
//				window.location = "sent"
//			}
//		}
//		else
//			flashMessage.display("Oops!  There was a problem sending.");
//
//		// Close progress dialog
//		$("#sending").dialog('close');
//	},
//	
//	markup: {
//		root:"<%= hasMore %>",
//		loadMoreButton:"<a class='loadMore ui-button ui-theme-gray'>Load More...</a>"
//	}
//});
//
