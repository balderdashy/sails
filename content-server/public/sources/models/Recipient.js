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

var Recipient = Backbone.Model.extend({
	initialize: function(obj) {
		// Cast fields that must be integers
		obj.id = +obj.id;
		this.id = obj.id;

		this.attributes = obj;
	},
	defaults: {},
	rules: {}
})



//var RecipientView = Backbone.View.extend({
//	initialize: function(model,containerElement) {
//		_.bindAll(this);
//		this.model = model;
//		this.containerEl = containerElement;
//		this.render();
//	},
//	events: {
//		"click a.remove":'destroy'
//	},
//	generateHTML: function () {
//		var template = "<li><span>{{value}}</span><a class='remove'>remove</a></li>";
//		var map = {
//			value:this.model.attributes.name
//		}
//		var buttonHTML = $.stubble(template,map);
//		return buttonHTML;
//	},
//	render: function () {
//		var newElem = $(this.generateHTML()).appendTo(this.containerEl);
//		this.el = newElem;
//		this.delegateEvents();
//	},
//	destroy: function (e) {
//		$("#numRecipients").val((+ $("#numRecipients").val()) - 1);
//
//		// Check here in case this is a removal as a result of a duplicative entry
//		if (this.model.collection)
//			this.model.collection.remove(this.model);
//		this.remove();
//	}
//})
