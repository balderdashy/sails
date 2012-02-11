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

var ReportView = Backbone.View.extend({
	events: {},
	initialize: function () {
		this.el = '.report';
		_.bindAll(this);
		$(this.domReady);
	},

	// Fired when document is ready
	domReady: function () {
		var me = this;
		if (!this.el)
			throw new Error("this.el has not been specified.");
		this.el = $(this.el);

		// Gobble up button information from phone preview
		var rows = this.rows = [];
		$(".phone-preview ul.buttons li.button").each(function () {
			rows.push([
				$(this).children('a').text(),
				+$(this).attr('data-numInteractions')
				]);
		});

//		var notYetResponded = +$(".phone-preview ul.buttons").attr('data-notYetResponded');
//		rows.push([
//			'Not yet responded',
//			notYetResponded
//		]);
		

		// Create button interaction level comparison chart
		new ChartView({
			el: $("div.button-split .chart"),
			width:350,
			height:200,
			title:'Cumulative Button Interactions',
			columns: {
				label: 'string',
				count: 'number'
			},
			rows:this.rows
		});

		// Augment all percent-bars on the page
		$(".percent-bar").each(function () {
			var percent = $(this).attr('data-percent'),
			startWidth = $(this).width();

			var subWidth = startWidth * (percent/100);
			var innerElement = $(me.innerPercentBar).appendTo(this);
			innerElement.width(0);
			innerElement.animate({
				width: subWidth+"px"
			},800)
		});
	},

	innerPercentBar: "<div class='inner'></div>"
});

// Instantiate
t = new ReportView();