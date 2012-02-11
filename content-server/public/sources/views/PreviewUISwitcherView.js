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

/**
* Controls which UI is selectd on the composer
*/
var PreviewUISwitcherView = Backbone.View.extend({
	selected: null,
	initialize: function () {
		_.bindAll(this);
		this.el = ".interface-selector";
		$(this.domReady);
	},
	domReady: function () {
		this.el = $(this.el);
		
		// Default to iphone message preview
		this.selectedIcon = this.el.find("#iphone-icon");
		this.selectedUI = $("#iphone");

		this.delegateEvents();
		this.render();
	},
	render: function () {

		this.el.find("a.ui-option").removeClass("selected");
		$(this.selectedIcon).addClass("selected");

		$(".ui-preview").hide();
		$(this.selectedUI).show();
	},
	events: {
		"click a.ui-option":"userSelect"
	},
	markup: {},




	userSelect: function (e) {
		var element = $(e.currentTarget),
			ui = element.attr('data-ui');

		// Disable switching to XML view for now
		if (ui=="xml") {
			return
		}

		// Generate container (todo: make this a bit more resistant to naming collisions)
		var containerId = "#"+ui;
		
		// Update selected UI/icon and render
		this.selectedUI = $(containerId);
		this.selectedIcon = this.el.find("#"+ui+"-icon");

		this.render();
	}
});