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


var Message = Row.extend({
	urlRoot: '/modifyMessage',
	rules: {
		'subject':[
			{
				name:"maxlength",
				maxlength: 37
			},
			"required"
		]
	}
});


//var Message = Backbone.Model.extend({
//	urlRoot: '/modifyMessage',
//	initialize: function(attrs) {
//		// Cast fields that must be integers
//		attrs.id = +attrs.id;
//		this.id = attrs.id;
//
//		this.body = attrs;
//		this.attributes = attrs;
//		this.view = new MessageView({
//			model: this
//		});
//	},
//	defaults: {
//	},
//	rules: {
//		'subject':[
//			{
//				name:"maxlength",
//				maxlength: 37
//			},
//			"required"
//		]
//	}
//});