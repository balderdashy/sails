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

var Group = Backbone.Model.extend({

	initialize: function(params) {
		this.attributes.recipients = [];
		
		// Cast fields that must be integers
		params.id = +params.id;
		this.id = params.id;
		
		this.attributes = _.extend(this.attributes,params);
	},


	defaults: {},


	rules: {}
})