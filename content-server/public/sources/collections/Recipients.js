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

// Recipient Collection
var Recipients = Backbone.Collection.extend({
	model: Recipient,
	
	// Flags for filtering, searching, and pagination
	hasMore: false,
	
	// Enforce uniqueness restriction for recipient collection 
	add: function (recipients) {
		if (_.isArray(recipients)) {
			var ok = true;
			_.each(recipients,function(r) {
				ok &= this.isOk(r);
			},this)

			if (!ok) return false;
			else
				return Backbone.Collection.prototype.add.call(this, recipients);
		}
		else
			return this.addOne(recipients);
	},

	addOne: function (recipient) {
		
		var isDupe = this.any(function(_recipient) {
			return _recipient.get('id') === recipient.get('id');
		});
		if (isDupe) {
			return false;
		}
		return Backbone.Collection.prototype.add.call(this, recipient);
	},

	// Don't allow duplicates
	isOk: function (recipient) {
		var isDupe = this.any(function(_recipient) {
			return _recipient.get('id') === recipient.id;
		});
		return !isDupe;
	}
})