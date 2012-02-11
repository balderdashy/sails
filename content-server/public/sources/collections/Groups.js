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

var Groups = Backbone.Collection.extend({

	model: Group,
	
	initialize: function () {
		_.bindAll(this);
	},
	
	// Enforce uniqueness restriction
	add: function (groups) {
		if (_.isArray(groups)) {
			var ok = true;
			_.each(groups,function(r) {
				ok &= this.isOk(r);
			},this)

			if (!ok) return false;
			else
				return Backbone.Collection.prototype.add.call(this, groups);
		}
		else
			return this.addOne(groups);
	},
	addOne: function (group) {
		var isDupe = this.any(function(_group) {
			return _group.get('id') === group.get('id');
		});
		if (isDupe) {
			return false;
		}
		return Backbone.Collection.prototype.add.call(this, group);
	},
	
	// Don't allow duplicates
	isOk: function (group) {
		var isDupe = this.any(function(_group) {
			return _group.get('id') === group.id;
		});
		return !isDupe;
	}

})