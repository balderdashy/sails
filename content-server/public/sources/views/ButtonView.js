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

var ButtonView = Backbone.View.extend({

	tagName: 'li',


	initialize: function() {
		_.bindAll(this);
	},


	render: function () {
		var template = this.markup;
		var map = _.extend({
			isLong: (this.model.attributes.longButton) ? "long":""
		},this.model.attributes);
		var buttonHTML = $.stubble(template,map);
		return buttonHTML;
	},


	markup: "<li class='button {{isLong}}'><a>{{label}}</a></li>"

});