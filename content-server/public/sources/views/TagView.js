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

var TagView = Backbone.View.extend({
	events: {
		"click a.remove":'destroy'
	},
	initialize: function(options) {
		_.bindAll(this);
		this.model = options.model;
		this.containerEl = "#tag-navigator";
		this.el = null;

	// Render is called by creator
	// (must wait until id of new tag is known)
	},
	
	
	generateHTML: function () {
		var template = this.markup;
		var map = {
			name:this.model.attributes.name,
			id:this.model.attributes.id
		}
		var buttonHTML = $.stubble(template,map);
		return buttonHTML;
	},
	
	
	render: function () {
		
		// First time render
		if (!this.el) {
			var newElem = $(this.generateHTML()).appendTo(this.containerEl);
			this.el = newElem;
		}
		this.delegateEvents();

		// Make tag draggable here so that new tags will get property as well
		$(this.el).children('a.tag').draggable({
			revert: false,
			revertDuration: 150,
			helper: 'clone',
			scroll: false,
			appendTo: 'body'
		});
	},
	
	
	destroy: function (e) {
		// Remove draggable to avoid js errors through accidental dragging
		$(this.el).children('a.tag').draggable('destroy');

		// Deselect filter for this tag
		if (typeof tagsView != 'undefined') {
			tagsView.deselectFilter(this.el);
		}

		// Id must be specified in order for backbone to talk to the server
		this.model.id = this.model.attributes.id;

		// Remove from server
		this.model.destroy();
		
		// Remove from DOM
		this.remove();

		// Cascade delete and remove this tag from all visible messages
		// (server-side cascade will occur automatically)
		var tagId = this.model.id;
		if (typeof messagesView != 'undefined') {
			
			// Update model
			messagesView.collection.each(function (message) {
				var tagList = _.reject(message.get('tags'),function (it) {
					return it.id==tagId;
				});
				message.set({
					tags:tagList
				});
			});
			
			// Update DOM
			messagesView.render();
			
		}
		else if (typeof phoneView != 'undefined') {
			// Update model and view (defer to tagview)
			phoneView.tagview.removeTag(tagId);
		}
		
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		return false;
	},
	
	
	markup: '<li data-id="{{id}}">'+
			'<a data-id="{{id}}" class="tag">{{name}}</a>'+
			'<a class="remove action"></a>'+
//			'<a class="filterByTag filter action"></a>'+
			'</li>'
});