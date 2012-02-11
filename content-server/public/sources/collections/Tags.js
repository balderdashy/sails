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

var Tags = Backbone.Collection.extend({
	model: Tag,
	url: '/tag',

	// Enforce uniqueness restriction for collection
	add: function (tag) {
		var isDupe = this.any(function(_tag) {
			return _tag.get('name') === tag.get('name');
		});
		if (isDupe) {
			tag.view.remove();
			return false;
		}
		return Backbone.Collection.prototype.add.call(this, tag);
	},

	comparator: function(model) {
		return model.get("name");
	}
})