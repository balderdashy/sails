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

var Tag = Backbone.Model.extend({
	urlRoot: '/tag',
	initialize: function(attrs) {
		// Cast fields that must be integers
		// Id will only be present if this is an edit, not a create
		if (attrs && attrs.id) {
			attrs.id = +attrs.id;
			this.id = attrs.id;
		}
	
		this.body = attrs;
		this.attributes = attrs;
		this.view = new TagView({
			model: this
		});
	},
	defaults: {},
	rules: {}
})
