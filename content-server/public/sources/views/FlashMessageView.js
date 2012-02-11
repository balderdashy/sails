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

var FlashMessage = Backbone.View.extend({
	events: {
		"click": "hide"
	},
	initialize: function (options) {
		_.bindAll(this);
		this.el = options.el;
		$(this.ready)
	},
	ready: function () {
		this.delegateEvents();
		this.resetTimer(this.hide);
	},
	resetTimer: function (fn) {
		this.timer = setTimeout(fn,2500);
	},
	hide: function () {
		var me = this;
		clearTimeout(this.timer);
		$(this.el).animate({
			marginTop:'-100px',
			marginBottom:0,
			opacity:0
		},250, function () {
			$(this.el).hide();
		});
	},
	show: function () {
		var me = this;
		clearTimeout(this.timer);
		$(this.el).css({
			display:'block',
			marginTop:'-100px',
			marginBottom:0,
			opacity:0
		});
		$(this.el).animate({
			marginTop:'0px',
			marginBottom:0,
			opacity:0.9
		},250, function () {
			me.resetTimer(me.hide);
		});
	},
	display: function (message) {
		if ($(this.el).length < 1) {
			$("#flash-container").append("<div id='flash'></div>");
		}
		$(this.el).text(message);
		this.show();
	}
});

var flashMessage = new FlashMessage({
	el: "#flash"
});