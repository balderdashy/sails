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

// Button Collection
var Buttons = Backbone.Collection.extend({

	model: Button,


	max: 6,


	onFull: function () {
		// Remove add-button button from UI
		$("li.add-button").remove();
	}
	
})