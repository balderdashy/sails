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

var ComposeRecipientView = Backbone.View.extend({

	initialize: function(params) {
		_.bindAll(this);
		this.model = params.model;
		this.collectionView = params.collectionView;
		this.render();
	},


	events: {
		"click a.remove":'destroy'
	},


	generateHTML: function () {
		var template = "<li><span>{{value}}</span><a class='remove'>remove</a></li>";
		var map = {
			value:this.model.attributes.name
		}
		var buttonHTML = $.stubble(template,map);
		return buttonHTML;
	},


	render: function () {
		var newElem = $(this.generateHTML()).appendTo(this.collectionView.el);
		this.el = newElem;
		this.delegateEvents();
	},


	destroy: function (e) {
		if (this.model.collection) {
			this.collectionView.collection.remove(this.model);
			this.collectionView.render();
		}
	}
	
})
