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

var Button = Backbone.Model.extend({
	initialize: function(obj) {
		// Cast fields that must be integers
		obj.longButton = +obj.longButton;
		obj.dontTrack = +obj.dontTrack;
		obj.external = +obj.external;
		obj.includeLocation = +obj.includeLocation;
		obj.posIndex = +obj.posIndex;
		obj.id = +obj.id;
		obj.attachmentId = +obj.attachmentId;
		this.body = obj;
		this.attributes = obj;
	},


	defaults: {
		id: -1,
		type: 'displayMessage',
		label: '',
		value: '',
		longButton: true,
		external: false,
		includeLocation: false,
		dontTrack: false,
		textEntry: null,
		extraData: null,
		posIndex: null,
		filename: null,
		attachmentId: -1
	},


	rules: {
		label: [
			{
				name:"maxlength",
				maxlength: 40
			},
			"required"
		],
		
		value: "required"
	}
})