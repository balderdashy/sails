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

var RecipientPicker = Backbone.View.extend({
	events: {
		"click a.cancel":"clickedCancel",
		"click a.save":"clickedSave",
		"change #selectAllRecipients":"clickedSelectAll",
		'click .loadMoreResults':'clickedLoadMore'
	},
	
	// Start on page 0, user can activate LoadMore to get more pages
	page: 0,
	
	// How many models to load at a time
	perPage: 16,
	
	filters: {
		searchFilter: ''
	},
	
	emptyText: "No recipients available.",
	
	noneFoundText: "No matches found.",
	
	hasMore: false,
	

	recipientViews: [],

	// Whether this recipient picker has fetched new data from the server
	fresh: false,
	
	// label for the 'Done' button
	buttonLabel: "Save",
	
	// Whether to allow 0 recipients to be selected and still trigger callback
	allowNone: false,

	// Collection of group views
	groupViews: [],
	
	// What, if any, UI filter is applied
	// (currently, only "selected" or null are supported
	uiFilter: null,
	
	
	// User clicked loadMore button
	clickedLoadMore: function () {
		this.page++;
		this.fetchSearchResults();
	},
	
	
	// Triggered every time user presses a key in the search bar
	userTypedInSearchBar: function (e) {
		
		// TODO: Ignore key presses that don't matter, to reduce # of requests
		
		// Use timer to reduce # of requests
		this.keyupTimer && window.clearTimeout(this.keyupTimer);
		this.keyupTimer = window.setTimeout(this.filterBySearch, 50);
	},
	
	
	// Apply the user search filter
	filterBySearch: function (){

		// Reset page
		this.page = 0;

		// Filter table
		var query = $(this.el).find('.filter-bar input').val();
		if (query.length > 0) {

			// Fetch filtered results
			this.filters.searchFilter = query;
			this.fetchSearchResults();
		}
		else {
//			this.filters.searchFilter = "";
			this.renderGroups();
		}
		
		
	},
	
	
	clickedSelectAll: function (e) {
		var elem = $(e.currentTarget);
		
		// Deselect all
		if (! elem.is(":checked")) {
			this.deselectAll();
		}
		// Select all
		else {
			this.selectAll();
		}
	},
	
	
	// User clicked the save button
	clickedSave: function(e) {
		//		Log.log("this.initialRecipients @ save: ",this.initialRecipients)
		
		// If nothing is selected, don't do anything
		if (this.allowNone || this.checkedRecipients.length > 0) {

			// Calculate deleted recipients using set difference (see lib.js)
			var deletedRecipients = (this.initialRecipients).difference(this.checkedRecipients);

			// Call recipient picker callback handler
			this.callback(this.checkedRecipients,deletedRecipients,this.checkedGroups);

			// Close dialog
			this.close();
		}

		e.stopImmediatePropagation();
		e.preventDefault();
		return false;
	},


	// User clicked the cancel button
	clickedCancel: function() {
		this.close();
	},
	
	// Called when the dialog assumes focus
	focusedDialog: function (event,ui) {},
	
	
	// Called when the document is ready
	domReady: function() {
		// Create dialog
		var dialogMarkup = $.stubble(this.markup.dialog,{});
		$("body").append($(dialogMarkup));
		this.el = $(this.el);
		this.el.dialog({
			focus: this.focusedDialog,
			close: this.unmodal,
			width: 570,
			height:500,
			dialogClass: 'slick-dialog',
			autoOpen: false,
			modal: true,
			title: 'Browsing recipients...',
			show: 'fade',
			hide: 'fade',
			resizable: false,
			draggable: false
		});
		
		$(this.el).find('.filter-bar input').live('keyup',this.userTypedInSearchBar);
},
	
	
	
	fetchedSearchResults: function (response) {
		this.hasMore = response.hasMore;
		
		
		this.recipients.reset(response.recipients);
		
		this.renderSearchResults();
		
//		if (!response || !response.data || !response.data.recipients) {
//			throw new Error("Recipients were not handed down from server.");
//			return;
//		}
//		
//		
//		this.hasMore = response.hasMore;
//		response = response.data;
//		
//		// Build recipient list from server
//		this.recipients.add(response.recipients);
//
//		// Parse checked recipients from server if provided
//		if (response.checked) {
//			this.initialRecipients.reset(response.checked);
//		}
//		
//		// Add a group for uncategorized recipients
//		var uncategorized = new Group({
//			id: 0,
//			name: 'Uncategorized'
//		});
//		this.groups.add(uncategorized);
//
//		// Parse recipients into groups
//		this.recipients.each(function (recipient) {
//			if (recipient.attributes.group) {
//				this.groups.add(recipient.attributes.group && new Group(recipient.attributes.group));
//
//				var group = this.groups.get(recipient.attributes.group.id)
//				group.attributes.recipients.push(recipient);
//			}
//			else {
//				// Or label the recipient as unclassified
//				uncategorized.attributes.recipients.push(recipient);
//			}
//		},this);
//		
//		this.busy = false;
//		this.fresh = true;

	},
	
	
	fetchedInitial: function(response) {
		// Parse checked recipients from server if provided
		if (response.checkedRecipients) {
			this.initialRecipients.reset(response.checkedRecipients);
		}
		
		this.modal();
		
		// Parse group members and meta information
		this.groups.reset(response.groups);
	},


	
	
	
	// Initial set-up
	// Get recipients from the DOM that haven't been saved yet
	initialize: function (options) {
		this.el = "#recipientPicker";
		this.wrapperEl = "#recipientPicker";
		this.collectionEl = ".recipient-grid";
		
		// List of initially checked recipients from DOM (not from server)
		this.initialRecipients = options.checkedRecipients || new Recipients;
		this.initialGroups = options.checkedGroups || new Groups;
		
		this.callback = options.callback;
		this.buttonLabel = options.buttonLabel || "Save";
		this.allowNone = this.allowNone || options.allowNone;

		this.recipients = new Recipients
		this.checkedRecipients = new Recipients;
		this.groups = new Groups;
		this.checkedGroups = new Groups;
		
		
		_.bindAll(this);
		$(this.domReady);
	},
	
	// What filter, if any, is currently applied?
	// null or "selected"
	filter: function () {
		return this.uiFilter;
	},


	// Show the dialog
	show: function () {

		// Open dialog box
		this.el.dialog('open');
		

		// Hide close button
		$(".ui-dialog-titlebar-close").hide();

		
		// Fetch basic data and clear local store
		
		$.when( $.Deferred(this.fetchInitial) ).done( this.render );
		this.lastMessageId = this.messageId;
		
		
		this.delegateEvents();
	},
	
	
	// Close the dialog box
	close: function () {
		
//		this.initialRecipients.reset();
		this.render();
		this.el.dialog('close');
		this.unmodal();
	},
	
	
	// Go get core information, like group listing and member counts
	// Also get the list of already-selected recipients
	fetchInitial: function (deferred) {
		var me = this;
		
		// Whether to get prechecked recipients and message ID from server
		var options = {
			messageId:(this.messageId) ? +this.messageId : null,
			getChecked:this.getChecked
		};
				
		$.getJSON("/recipient/pickerData",options,function(response) {
			me.fetchedInitial(response);
			deferred.resolve();
		});
	},
	
	fetchSearchResults: function () {
		var me = this, 

		options = {
			page: this.page,
			max: this.perPage,
			offset: this.page*this.perPage,
			searchFilter: (this.filters && this.filters.searchFilter) || ""
		};

		// If this is a paginated request, it is additive
		if (this.page != 0) {
			$.getJSON("/recipient/fetch",options,me.fetchedSearchResults);
		}
		// Fetch new recipients from page 0
		else {
			$.getJSON("/recipient/fetch",options,me.fetchedSearchResults);
		}
		
		this.modal();
	},


//	// Go get fresh recipients w/o groups
//	fetchRecipients: function (deferred) {
//		var me = this, 
//
//		// Remember whether to get prechecked recipients and message ID from server
//		options = {
//			messageId:(this.messageId) ? +this.messageId : null,
//			getChecked:this.getChecked,
//			
//			page: this.page,
//			max: this.perPage,
//			offset: this.page*this.perPage
//		};
//
//		// If this is a paginated request, it is additive
//		if (this.page != 0 && !this.busy) {
//			this.busy = true;
//			$.getJSON("/recipient/fetch",options,function(response) {
//				me.fetchedRecipients(response);
//				me.render();
//			});
//		}
//		// Only go fetch new recipients if this is the first time and the interface is not busy
//		else if (!this.fresh && !this.busy) {
//			this.busy = true;
//			$.getJSON("/recipient/fetch",options,function(response) {
//				me.fetchedRecipients(response);
//				deferred.resolve();
//			});
//		}
//		else if (this.busy) {
//			Log.log("Blocked attempt to interrupt busy recipient picker.");
//			deferred && deferred.resolve();
//		}
//		else {
//			deferred && deferred.resolve();
//		}
//		
//		
//		// If this is a "load more" request, display the inline spinner
//		if (this.page != 0) {
//			var loadMoreButton = this.el.find(".loadMore");
//			loadMoreButton.text('');
//			$('<div class="empty-table"><img class="loader" src="/images/ajax-loader.gif"/></div>').appendTo(loadMoreButton).center();
//		}
//	},
	
	
	// Make dialog modal
	modal: function (){
		var modalZone = this.el.find('.recipient-grid');
		if (this.page == 0) {
			// empty conainer and display loading spinner
			modalZone.children().hide();
			$(this.markup.spinner).appendTo(modalZone).center();
		}
		else {
			// If this is a "load more" request, display the inline spinner
			var loadMoreButton = this.el.find(".loadMore");
			loadMoreButton.text('');
			$(this.markup.spinner).appendTo(loadMoreButton).center();
		}
	},
	
	
	unmodal: function (){
		this.busy = false;
	},


	// Select all groups
	selectAll: function () {
		_.each(this.groupViews,function(view) {
			view.select();
		});

		// Update save button
		this.updateSaveButton();
	},

	deselectAll: function () {
		// clear the filter bar to eliminate confusion
		this.el.find(".filter-bar input").val("");
		this.el.find(".filter-bar input").trigger("keyup");

		// Deselect all groups
		_.each(this.groupViews,function(view) {
			view.deselectAll();
		});

		// Update save button
		this.updateSaveButton();
	},

	

	// Check # of checked recipients--
	// enable/disable save button if necessary
	updateSaveButton: function () {
		var saveButton = this.el.find("a.save");
		if (this.allowNone || this.checkedRecipients.length > 0) {
			saveButton.removeClass('disabled');
		}
		else {
			saveButton.addClass('disabled');
		}
	},

	
	
	
	// Template and return dynamic HTML (for loadMore button)
	generateLoadMoreHTML: function () {
		var data = {
			hasMore: this.hasMore ? this.markup.loadMoreButton : ""
		}
		var template = _.template(this.markup.loadMore),
			html = template(data);
		return html;
	},
	


	// Draw the stuff inside the recipient picker dialog
	render: function () {
		// Reset checked recipients in UI using stored version
		this.checkedRecipients.reset(this.initialRecipients.models);
		this.checkedGroups.reset(this.initialGroups.models);
		
		
		this.renderGroups();
	},
	
	// Render dialog frame
	renderBasic: function () {
		
		// Replace dialog w/ empty list
		var populatedDialogMarkup = $.stubble(this.markup.contents,{
			buttonLabel: this.buttonLabel
		});
		this.el.empty().append(populatedDialogMarkup);
	
		// Update save button
		this.updateSaveButton();
		
		
		this.delegateEvents();
	},
	
	// Render list of groups
	renderGroups: function () {
		this.renderBasic();
		
		// Render groups
		$(this.collectionEl).empty();
		this.groups.each(function(group) {
			var view = new GroupChoiceView({
				model: group,
				collectionView: this
			});
			this.groupViews.push(view);
		},this);
		
		// Focus on searchbar again
		$(this.el).find('.filter-bar input').focus();
		
	},
	
	// Render a list of recipient search results
	renderSearchResults: function () {
		
		// Wipe everything if this is the first page
		if (this.page==0) {
			$(this.collectionEl).empty();
		} else {
		}
		
		$(this.el).find('.emptytext').remove();
		if (this.recipients.length == 0) {
			var msg;
			if (this.anyFilters()) {
				msg = this.noneFoundText;
			}
			else {
				msg = this.emptyText;
			}

			$("<div class='emptytext'>" + msg + "</div>").appendTo(this.collectionEl)
		}
		else {
			this.recipients.each(function(recipient) {
				var view = new RecipientChoiceView({
					model: recipient,
					collectionView: this,
					pickerView: this
				});
				this.recipientViews.push(view);
			},this);
		}
		
		// Display/hide "Load More..." button if necessary
		this.el.find('.loadMoreResults').remove();
		$(this.generateLoadMoreHTML()).appendTo(this.el.find('.recipient-grid'));
		
	},
	
	
	anyFilters: function () {
		return this.filters && (
				(this.filters.searchFilter && this.filters.searchFilter.length > 0)
			);
	},



	markup: {
		spinner:'<img class="loader" src="/images/ajax-loader.gif"/>',
		
		dialog:
		'<div id="recipientPicker" class="modal dialog">'+
		'<img src="/images/spinner.gif"/>'+
		'</div>',

		contents:
		'<div class="filter-bar">'+
		'<input type="text" placeholder="Search" />'+
		'</div>'+
		'<div class="select-all">'+
		'<input id="selectAllRecipients" type="checkbox">'+
		'<label for="selectAllRecipients">select / deselect all</label>'+
		'</div>'+
		'<ul class="recipient-grid"></ul>'+
		'<div class="actions">'+
		'<a class="cancel ui-button ui-theme-hollow">or cancel</a>'+
		'<a class="save ui-button ui-theme-red">{{buttonLabel}}</a>'+
		'</div>',
	
		loadMore:"<%= hasMore %>",
		
		loadMoreButton:"<a class='loadMoreResults ui-button ui-theme-gray recipient-picker'>Load More...</a>"
		
	}

});