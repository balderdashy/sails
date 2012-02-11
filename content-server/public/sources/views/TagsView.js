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

var TagsView = Backbone.View.extend({


	// Used to manage inconsistent states during server communications
	promise: null,
	
	
	// Whether a filter was included in the URL (as a fragment)
	requestFilterApplied: false,


	events: {
		"keydown #newTag input":"userAddsTag",
		"click #tag-navigator li a.tag":"userClicksFilter"
	},


	initialize: function() {
		_.bindAll(this);

		this.filters = [];

		this.collection = new Tags;
		this.el = "body";
		this.containerEl = "#tag-navigator";
		$(this.ready);
	},


	// Fired when document is ready
	ready: function () {
		// Make promise that I will be in a consistent state someday
		this.promise = $.Deferred();

		// Reveal tag UI
		$(".tags").show();

		var me = this;
		this.delegateEvents();
		$(this.containerEl).empty();

		// Start loading tags
		me.collection.fetch({
			success: me.tagsLoaded
		});

		// Display loading indicator
		this.modalize();
	},


	// Tags finish loading after XHR
	tagsLoaded: function (collection,response) {
		this.render();
		this.unmodalize();
	},

	
	// Tags are ready and queryable
	tagsReady: function () {
		var spinn = $(this.containerEl).children('img');
		if (spinn)
			spinn.remove();

		// If filter is set, automatically start off filtering by the specified tag
		var initialFilter = getFragmentParameterByName('filter');
		if (initialFilter && !this.requestFilterApplied) {
			this.requestFilterApplied = true;
			var elem = $(this.containerEl).find("li[data-id='"+initialFilter+"']");
			this.selectFilter(elem);
		}
	},


	// User clicks on a filter
	userClicksFilter: function (e) {
		var tagElem = $(e.currentTarget).parent();
		var tagId = tagElem.attr('data-id');

		// If the message list doesn't exist, 
		// navigate to the proper page and then filter
		if (typeof messagesView == "undefined") {
			window.location='/message/sent#filter='+tagId
		}
		else {
			// Toggle tag ui state and add/remove filter
			if (!tagElem.hasClass("selected")) {
				this.selectFilter(tagElem);
			}
			else {
				this.deselectFilter(tagElem);
			}
		}

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		return false;
	},
	
	
	userAddsTag: function (e) {
		var KEY_ENTER = 13,
		code = (e.keyCode ? e.keyCode : e.which);
		// Trap enter here
		if (code == KEY_ENTER) {
			var input = $(e.currentTarget);
			if (input.val().length > 0) {

				// Strip whitespace and add tag to collection
				var value = $.trim(input.val());
				this.add({
					name: value
				});

				// Clear input
				input.val("");
			}
		}
	},


	render: function () {
		this.collection.each(function(a) {
			a.view.render();
		})
	},

	// Disable UI and replace w/ modal loading indicator
	modalize: function () {
		var tags = $(this.containerEl).children('li');
		tags.css({
			opacity: 0.4
		});
		var spinner = $('<img class="loader" src="/images/ajax-loader.gif"/>').appendTo(this.containerEl);
		spinner.center();
	},

	// Hide loading indicator and reveal proper UI
	unmodalize: function () {
		var me = this;
		var tags = $(this.containerEl).children('li');
		var spinn = $(this.containerEl).children('img');

		// Revert tag opacity
		tags.css({
			opacity: 1
		});
		
		// Hide tags which were appended automatically by backbone
		tags.hide();

		// Finished loading, remove spinner
		if (spinn.length > 0) {
			tags.fadeIn(150);
			spinn.fadeOut(150,function () {
				me.tagsReady();
			});
		} else {
			tags.show();
			me.tagsReady();
		}
	},
	
	
	// Remove a filter by element
	deselectFilter: function(tagElem) {
		var tagId = tagElem.attr('data-id');
		tagElem.removeClass('selected');
		this.filters = _.reject(this.filters,function(id) {
			return id == tagId;
		});

		// Clear fragment in case this filtering was the result of a
		// redirect from the compose or report views
		window.location.hash = "";

		// Do filtering
		this.applyFilters();
	},


	// Add a new filter by element
	selectFilter: function (tagElem) {
		var tagId = tagElem.attr('data-id');
		tagElem.addClass('selected');
		this.filters.push(+tagId);

		// Do filtering
		this.applyFilters();
	},


	// Remove all filters
	deselectAllFilters: function () {
		var container = $(this.containerEl);
		window.location.hash = "";

		_.each(this.filters, function (value,key) {
			container.find("li[data-id='"+value+"']").removeClass('selected');
		})

		this.filters = [];
		
		this.applyFilters();
	},


	// Filter messagesView
	applyFilters: function () {
		if (typeof messagesView != 'undefined') {
			// Reset paging
			messagesView.page=0
			
			messagesView.loadData();
		}
		
		
		

//		// For each message
//		messagesView.collection.each(function (model) {
//
//			// Edge case w/ all filters deselected
//			if (me.filters.length == 0) {
//				$(model.view.el).show();
//			}
//
//			// If any of this message's tags match
//			if (_.all(me.filters,function(id) {
//				// Check each filter
//				return _.any(model.get('tags'),function(tag) {
//					return id == tag.id;
//				});
//			})) {
//				// Show model
//				$(model.view.el).show();
//			}
//			else {
//				// Hide offending model
//				$(model.view.el).hide();
//			}
//		});
	},


	// Send new tag to backend for addition
	add: function (obj) {
		var me = this;
		var tag = new Tag(obj);
		if (this.collection.add(tag)) {

			// display modal loading indicator
			this.modalize();
			
			tag.save(null,{
				success: function (model,response) {
					tag.id = response.id;
					me.render();
					me.unmodalize();
				}
			});


			return true;
		}
		else return false;
	}
});