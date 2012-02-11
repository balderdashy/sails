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

var GroupChoiceView = Backbone.View.extend({

	// Start on page 0, user can activate LoadMore to get more pages
	page: 0,
	
	// How many models to load at a time
	perPage: 16,
	
	filters: {
		searchFilter: ''
	},
	
	emptyText: "This group doesn't have any members yet.",
	
	hasMore: false,
	

	recipientViews: [],
	
	
	// Toggleable state variables
	expanded: null,
	selected: null,


	events: {
		"change input.select-group":"userSelectedGroup",
		"click a.collapse-expand-control":"userClickedCollapseExpandControl",
		"click span.numRecipients":"userClickedCollapseExpandControl",
		'click a.loadMore':'userClickedLoadMore'
	},
	
	userSelectedGroup: function (e) {
		this.selected.toggle();
	},
	
	
	userClickedCollapseExpandControl: function (e) {
		this.expanded.toggle();
			
	},
	
	userClickedLoadMore: function () {
		this.page++;
		$.when( $.Deferred(this.fetchGroupMembers) ).done( this.renderContents );
	},
	
	
	
	
	fetchedGroupMembers: function(response) {
		
		// Display this group's recipients, handling pagination
		if (this.page > 0) {
			// Add fetched group members in backbone collection
			this.recipients.hasMore = response.hasMore;
			this.recipients.add(response.recipients);
		}
		else {
			// Replace current collection
			this.recipients.hasMore = response.hasMore;
			this.recipients.reset(response.recipients);
			this.unmodal();
		}
	},
	
	
	
	initialize: function(params) {
		_.bindAll(this);
		
		// Create toggles
		this.selected = (new Toggle(false,this.select,this.deselectAll));
		this.expanded = (new Toggle(false,this.expand,this.collapse));
		
		this.recipients = new Recipients;
		
		this.model = params.model;
		this.collectionView = params.collectionView;
		this.render();
	},
	
	
	fetchGroupMembers: function (deferred) {
		var me = this;
		
		// Whether to get prechecked recipients and message ID from server
		var options = {
			
			messageId:(this.collectionView.messageId) ? +this.collectionView.messageId : null,
			getChecked: this.collectionView.getChecked,
			
			// Built-in filtering
			searchFilter: (this.filters && this.filters.searchFilter) || "",

			// Pagination
			page: this.page,
			max: this.perPage,
			offset: this.page*this.perPage,

			sort: this.sortField,
			order: this.sortOrder
		};
		
		// Only include groupid if it exists (i.e. this isn't the Unaffiliated group)
		if (this.model.id)
			options['groupId'] = this.model.id;
		
		this.modal();
		
		$.getJSON("/recipient/fetchGroupMembers",options,function(response) {
			me.fetchedGroupMembers(response);
			deferred.resolve();
		});
	},

	// Bake HTML for main dialog
	generateHTML: function () {
		var map = {
			name:this.model.attributes.name,
			id:this.model.attributes.id,
			numRecipients: this.model.attributes.numRecipients
		}
		return $.stubble(this.markup.root,map);
	},
	
	// Template and return html for loadmore button
	generateLoadMoreHTML: function () {
		var data = {
			hasMore: this.recipients.hasMore ? this.markup.loadMoreButton : ""
		}
		return data.hasMore;
	},



	// Actually create and append element (only should be run once)
	render: function () {
		var newElem = $(this.generateHTML()).appendTo(this.collectionView.collectionEl);
		this.el = newElem;	
		
		this.renderContents();
		
	},
	
	// Rerender contents
	renderContents: function () {
		
		this.collectionEl = this.el.find('.group-container');

			// Render recipients
			this.recipientViews = [];
			this.collectionEl.empty();
			this.recipients.each(function(recipient,index) {
				this.recipientViews.push(new RecipientChoiceView({
					model: recipient,
					collectionView: this
				}));			
			}, this);

		if (this.expanded.on) {
			this.collectionEl.children().show();
			
			// Display/hide "Load More..." button if necessary
			this.el.find('.loadMore').remove();
			var thing = $(this.generateLoadMoreHTML());
			thing.appendTo(this.collectionEl);
		}
		else {
			this.collectionEl.children().hide();
		}

		this.delegateEvents();
	},


	select: function () {
		this.selected.setOn();
		
		// Select group itself
		var newInput = this.el.find('input.select-group');
		newInput.prop("checked",true);
		newInput.parent().addClass('selected');

		// Add to the list of selected groups
		this.collectionView.checkedGroups.add(this.model);

		// Select all child recipients
		_.each(this.recipientViews,function(view) {
			view.select();
		});
	},


	deselect: function () {
		this.selected.setOff();
		
		// Deselect the group itself
		var newInput = this.el.find('input.select-group');
		newInput.prop("checked",false);
		newInput.parent().removeClass('selected');

		// Remove from list of selected groups
		this.collectionView.checkedGroups.remove(this.model);

		// Deselect "select all" checkbox if it's selected
		if ($("#selectAllRecipients").is(":checked")) {
			$("#selectAllRecipients").prop("checked",false);
		}
	},


	// Deselect group AND child recipients
	deselectAll: function () {
		this.deselect();

		// Deselect all child recipients
		_.each(this.recipientViews,function(view) {
			view.deselect();
		});
	},

	
	expand: function (){
		this.el.addClass('expanded');
		this.modal();
		$.when( $.Deferred(this.fetchGroupMembers) ).done( this.renderContents );
	},
	
	
	collapse: function (){
		this.el.removeClass('expanded');
//		this.recipients.reset();
		this.renderContents();
	},
	
	
	
	// Prevent user interaction
	modal: function (){
		if (this.page == 0) {
			// empty conainer and display loading spinner
			this.collectionEl.children().hide();
			$(this.markup.spinner).appendTo(this.collectionEl).children('.loader').center();
		}
		else {
			// If this is a "load more" request, display the inline spinner
			var loadMoreButton = this.collectionEl.find(".loadMore");
			loadMoreButton.text('');
			$(this.markup.spinner).appendTo(loadMoreButton).children('.loader').center();
		}
	},
	unmodal: function () {
		// TODO: reenable user interaction
	},


	markup: {
		root:
		"<li class='group'>"+
		"<div class='label-box'>"+
		"<input id='uwn-group-{{id}}' class='select-group' type='checkbox'/>"+
		"<label for='uwn-group-{{id}}' class='group-name'>{{name}}</label>"+
		"<a class='collapse-expand-control'></a>"+
		"<span class='numRecipients'>({{numRecipients}})</span>"+
		"</div>"+
		"<ul class='group-container'></ul>"+
//		"<%= hasMore %>"+
		"</li>",
	
		spinner: '<li class="loading"><img class="loader" src="/images/ajax-loader.gif"/></li>',
		loadMoreButton:"<li class='loadMore'><a class='loadMore ui-button ui-theme-gray'>Load More...</a></li>"
	}
})
