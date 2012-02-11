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


var MessageView = RowView.extend({
	
	events: {
		'click .delete' : 'clickedDestroy',
		'click .sendToSpecified' : 'clickedSend',
		'click ul.message-tags a.remove' : 'clickedRemoveTag'
	},
	
	clickedDestroy: function (e){
		$(this.el).trigger('mouseleave');
		
		if (confirm("Sure you want to delete this message?")) {
			return true;
		}
		else {
			e.stopImmediatePropagation();
			e.preventDefault();
			return false;
		}
	},
	
	clickedSend: function (e) {
		messagesView.recipientPicker.getChecked = $(e.currentTarget).attr('data-get-checked');
		messagesView.recipientPicker.messageId = $(e.currentTarget).attr('data-message-id');
		messagesView.recipientPicker.show();
		e.stopPropagation();
	},
	
	// User deleted a tag from this message
	clickedRemoveTag: function( e ) {
		var tagElement = $(e.currentTarget).parent(),
		tagName = tagElement.text(),
		tagId = +tagElement.attr('data-id');

		// Delete tag from client-side model
		var tagList = this.model.get('tags');
		tagList = _.reject(tagList,function (it) {
			return it.id==tagId;
		});

		// Persist tags
		this.model.set({
			tags: tagList
		})
		this.model.save();

		// TODO: display loading indicator

		// Update tag display on message in UI
		this.renderTags();

		// If the tag to be removed is currently one of the selected filters,
		// remove the parent message from the collection
		if (_.contains(tagsView.filters,tagId)) {
			messagesView.collection.remove(this.model)
			messagesView.render();
		}

		e.stopPropagation();
	},
	
	// User dropped tag on this message
	droppedTag: function( event, ui ) {
		var tagElement = ui.helper,
		tagName = tagElement.text();
		tagId = +tagElement.attr('data-id');

		// Add new tag to client-side model (enforcing uniqueness)
		var tagList = this.model.get('tags');

		tagList = _.reject(tagList,function (it) {
			return it.id==tagId;
		});
		tagList.push({
			name: tagName,
			id: tagId
		});

		// Persist tags
		this.model.set({
			tags: tagList
		})
		this.model.save();

		// TODO: display loading indicator

		// Update tag display on message in UI
		this.renderTags();

	},
	
	
	
	open: function () {
		var isSent = (this.model.collection.url == '/sentMessage');
		if (isSent) {
			window.location='/message/summary/'+this.model.get('id');
		}
		else {
			window.location='/message/edit/'+this.model.get('id');
		}
	},
	
	
	// Update tag display for this message
	renderTags: function () {
		var tagDisplay = this.el.find('.message-tags');
		var html = "";
		var tags = this.model.get('tags');

		// Sort tags
		tags = _.sortBy(tags,function (tag) {
			return tag.name;
		});

		// generate HTML
		for (t in tags) {
			html += $.stubble(this.markup.tag,{
				id: tags[t].id,
				color: tags[t].color,
				name: tags[t].name
			});
		}
		tagDisplay.html(html);
	},
	
	
	// Add a new message
	prepend: function () {
		var newElem = $(this.generateHTML()).prependTo(this.containerEl);
		this.el = newElem;
		this.delegateEvents();

		// Make message droppable
		$( this.el ).droppable({
			activeClass: "droppable",
			hoverClass: "highlighted",
			drop: this.droppedTag
		});

		this.renderTags();
	},

	
//	// Fetch using selected label filters
//	filter: function () {
//		return this.message_id
//	},
	
	
	// Return the HTML especially for this row
	generateHTML: function () {
		var template = (this.model.collection.url == '/sentMessage') ?
			this.markup.sent :
			this.markup.templates;

		// Adapt attributes to work:
		var map = this.model.attributes;
		map = this.transform(map);

		var html = $.stubble(template,map);
		return html;
	},
	
	
	
	render: function () {
		// Call parent function
		RowView.prototype.render.call(this);
		
		// Make message droppable
		$( this.el ).droppable({
			activeClass: "droppable",
			hoverClass: "highlighted",
			drop: this.droppedTag
		});

		this.renderTags();
	},
	
	
	markup: {
		sent:
		'<tr>'+
		'<td class="subject wide data" >'+
		'<p>{{subject}}</p>'+
		'<ul class="message-tags">'+
		'</ul>'+
		'</td>'+
		'<td class="dateSent data">{{dateSent}}</td>'+
		'<td class="numRecipients data">{{numRecipients}}</td>'+
		'<td class="numUniqueInteractions data">{{numUniqueInteractions}}</td>'+
		'<td class="actionButtons">'+
		'<a class="sendToSpecified ui-button ui-theme-darkred" data-get-checked="1" data-message-id="{{id}}">Send</a>'+
		'<a class="ui-button ui-theme-gray" href="/message/edit/{{id}}">Edit</a>'+
		'<a class="ui-button ui-theme-gray" href="/message/summary/{{id}}">View Report</a>'+
		'</td></tr>',

		templates:
		'<tr>'+
		'<td class="subject wide data" >'+
		'<p>{{subject}}</p>'+
		'<ul class="message-tags">'+
		'</ul>'+
		'</td>'+
		'<td class="data dateModified">{{dateModified}}</td>'+
		'<td class="actionButtons">'+
		'<a class="insulated sendToSpecified ui-button ui-theme-darkred" data-message-id="{{id}}">Send</a>'+
		'<a class="insulated ui-button ui-theme-gray" href="/message/edit/{{id}}">Edit</a>'+
		'<a class="insulated ui-button ui-theme-gray delete" href="/message/delete/{{id}}">Delete</a>'+
		'</td></tr>',

		tag:
		'<li data-id="{{id}}" data-color="{{color}}"><span>{{name}}</span><a class="insulated remove"></a></li>'
	}
});

//
//var MessageView = Backbone.View.extend({
//	events: {
//		'mouseenter' : 'mouseenter',
//		'mouseleave' : 'mouseleave',
//
//		'click' : 'openMessage',
//		'click .delete' : 'deleteMessage',
//		'click .sendToSpecified' : 'clickSend',
//		'click ul.message-tags a.remove' : 'deletedTag'
//
////		'mouseenter .insulated' : 'mouseleave',
////		'mouseleave .insulated' : 'mouseenter'
//	},
//
//	
//	initialize: function(options) {
//		_.bindAll(this);
//		this.model = options.model;
//		this.containerEl = "table.ui-table tbody";
//		this.el = null;
//
//		$(this.ready);
//	},
//
//
//	ready: function () {
//	},
//
//	mouseenter: function () {
//		$(this.el).addClass("hovered");
//	},
//	mouseleave: function () {
//		$(this.el).removeClass("hovered");
//	},
//
//	openMessage: function () {
//		var isSent = (this.model.collection.url == '/sentMessage');
//		if (isSent) {
//			window.location='summary/'+this.model.get('id');
//		}
//		else {
//			window.location='edit/'+this.model.get('id');
//		}
//	},
//
//	// Ask for confirmation before doing a delete
//	deleteMessage: function(e) {
//		$(this.el).trigger('mouseleave');
//		
//		if (confirm("Sure you want to delete this message?")) {
//			return true;
//		}
//		else {
//			e.stopImmediatePropagation();
//			e.preventDefault();
//			return false;
//		}
//	},
//
//	clickSend: function (e) {
//		messagesView.recipientPicker.getChecked = $(e.currentTarget).attr('data-get-checked');
//		messagesView.recipientPicker.messageId = $(e.currentTarget).attr('data-message-id');
//		messagesView.recipientPicker.show();
//		e.stopPropagation();
//	},
//
//	// User deleted a tag from this message
//	deletedTag: function( e ) {
//		var tagElement = $(e.currentTarget).parent(),
//		tagName = tagElement.text();
//		tagId = +tagElement.attr('data-id');
//
//		// Delete tag from client-side model
//		var tagList = this.model.get('tags');
//		tagList = _.reject(tagList,function (it) {
//			return it.id==tagId;
//		});
//
//		// Persist tags
//		this.model.set({
//			tags: tagList
//		})
//		this.model.save();
//
//		// TODO: display loading indicator
//
//		// Update tag display on message in UI
//		this.renderTags();
//
//		// Reapply any message filters
//		tagsView.applyFilters();
//
//		e.stopPropagation();
//	},
//
//
//	// User dropped tag on this message
//	droppedTag: function( event, ui ) {
//		var tagElement = ui.helper,
//		tagName = tagElement.text();
//		tagId = +tagElement.attr('data-id');
//
//		// Add new tag to client-side model (enforcing uniqueness)
//		var tagList = this.model.get('tags');
//
//		tagList = _.reject(tagList,function (it) {
//			return it.id==tagId;
//		});
//		tagList.push({
//			name: tagName,
//			id: tagId
//		});
//
//		// Persist tags
//		this.model.set({
//			tags: tagList
//		})
//		this.model.save();
//
//		// TODO: display loading indicator
//
//		// Update tag display on message in UI
//		this.renderTags();
//
//	},
//
//
//	// Update tag display for this message
//	renderTags: function () {
//		var tagDisplay = this.el.find('.message-tags');
//		var html = "";
//		var tags = this.model.get('tags');
//
//		// Sort tags
//		tags = _.sortBy(tags,function (tag) {
//			return tag.name;
//		});
//
//		// generate HTML
//		for (t in tags) {
//			html += $.stubble(this.markup.tag,{
//				id: tags[t].id,
//				color: tags[t].color,
//				name: tags[t].name
//			});
//		}
//		tagDisplay.html(html);
//	},
//
//	render: function () {
//		// Redraw all elements
//		var newElem = $(this.generateHTML()).appendTo(this.containerEl);
//		this.el = newElem;
//		this.delegateEvents();
//
//		// Make message droppable
//		$( this.el ).droppable({
//			activeClass: "droppable",
//			hoverClass: "highlighted",
//			drop: this.droppedTag
//		});
//
//		this.renderTags();
//	},
//
//	prepend: function () {
//		var newElem = $(this.generateHTML()).prependTo(this.containerEl);
//		this.el = newElem;
//		this.delegateEvents();
//
//		// Make message droppable
//		$( this.el ).droppable({
//			activeClass: "droppable",
//			hoverClass: "highlighted",
//			drop: this.droppedTag
//		});
//
//		this.renderTags();
//	},
//
//
//	generateHTML: function () {
//		var template = (this.model.collection.url == '/sentMessage') ?
//			this.markup.sent :
//			this.markup.templates;
//
//		// Adapt attributes to work:
//		var attrs = this.model.attributes;
//
//		// Get number of recipients
//		var numRecipients = attrs.numRecipients;
//
//		// and interactions
//		var numUniqueInteractions= attrs.numUniqueInteractions
//		
//		// Clean up dates w/ moment.js
//		var map = {
//			id: attrs.id,
//			subject: attrs.subject,
//			dateSent: moment(attrs.dateSent).from(moment()),
//			dateModified: moment(attrs.dateModified).from(moment()),
//			recipients: attrs.numRecipients,
//			numUniqueInteractions: numUniqueInteractions
//		}
//		var html = $.stubble(template,map);
//		return html;
//	},
//
//
//	destroy: function (e) {
//		// Id must be specified in order for backbone to talk to the server
//		this.model.id = this.model.attributes.id;
//
//		// Remove from server
//		this.model.destroy();
//
//		// Remove from DOM
//		this.remove();
//	},
//	
//	markup: {
//		sent:
//		'<tr>'+
//		'<td class="subject wide data" >'+
//		'<p>{{subject}}</p>'+
//		'<ul class="message-tags">'+
//		'</ul>'+
//		'</td>'+
//		'<td class="dateSent data">{{dateSent}}</td>'+
//		'<td class="numRecipients data">{{recipients}}</td>'+
//		'<td class="numUniqueInteractions data">{{numUniqueInteractions}}</td>'+
//		'<td class="actionButtons">'+
//		'<a class="sendToSpecified ui-button ui-theme-darkred" data-get-checked="1" data-message-id="{{id}}">Send</a>'+
//		'<a class="ui-button ui-theme-gray" href="edit/{{id}}">Edit</a>'+
//		'<a class="ui-button ui-theme-gray" href="summary/{{id}}">View Report</a>'+
//		'</td></tr>',
//
//		templates:
//		'<tr>'+
//		'<td class="subject wide data" >'+
//		'<p>{{subject}}</p>'+
//		'<ul class="message-tags">'+
//		'</ul>'+
//		'</td>'+
//		'<td class="data dateModified">{{dateModified}}</td>'+
//		'<td class="actionButtons">'+
//		'<a class="insulated sendToSpecified ui-button ui-theme-darkred" data-message-id="{{id}}">Send</a>'+
//		'<a class="insulated ui-button ui-theme-gray" href="edit/{{id}}">Edit</a>'+
//		'<a class="insulated ui-button ui-theme-gray delete" href="delete/{{id}}">Delete</a>'+
//		'</td></tr>',
//
//		tag:
//		'<li data-id="{{id}}" data-color="{{color}}"><span>{{name}}</span><a class="insulated remove"></a></li>'
//	}
//})