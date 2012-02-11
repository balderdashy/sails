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
* Handles UI for tag management from composer
*/
var InlineTagsView = Backbone.View.extend({

	el:'body',


	promise: null,


	initialize: function () {
		_.bindAll(this);

		this.tags = []
		this.deserializeTags();
		this.renderTags();
	},


	events: {
		"click .tag .remove":"userRemovesTag",
		"click .add-label-button":"displayTagPicker",
		"click a.empty-text":"displayTagPicker",
		"click #tag-picker a":"addTag"
	},


	tagContainerEl: "ul.tag-list",


	tagPickerEl: "#tag-picker",


	markup: {
		tag: '<li class="tag"><span>{{name}}</span><a class="remove"></a></li>',
		pickerTag: '<li><a data-color="" data-tagid="{{id}}">{{name}}</a></li>',
		addTag: '<li><a class="add-label-button"><span class="icon"></span></a></li>',
		emptyText: '<li><a class="empty-text">Add a label to this message</a></li>'
	},


	// Render the internal model of tags into the UI component
	renderTags: function (){

		var container = $(this.tagContainerEl);

		// Fill container w/ tags
		container.empty();
		this.tidyTags();
		
		// draw empty text if necessary
		if (this.tags.length == 0) {
			container.append(this.markup.emptyText);
		}
		else {
			_.each(this.tags,this.drawTag);
		}

		// Append add button
		container.append(this.markup.addTag);
	},


	drawTag: function (it) {
		var container = $(this.tagContainerEl);
		var html = $.stubble(this.markup.tag,it);
		var tagEl = $(html).appendTo(container);
		tagEl.data('tagid',+it.id);
	},


	// Display UI selector for user to pick a tag
	displayTagPicker: function (e) {
		var me = this;
		var x,y,button = $("a.add-label-button");
		var tagPicker = $(this.tagPickerEl);
		tagPicker.appendTo("body");

		x = button.outerWidth()+button.offset().left;
		y = 5+button.offset().top;
		tagPicker.css({
			left: x+"px",
			top: y+"px"
		});

		// Update internal tag list
		// TODO: wait until tagview is complete (use promise)
		var allTags = tagPicker.children('ul');
		allTags.empty();
		tagsView.collection.each(function (it) {
			allTags.append($.stubble(me.markup.pickerTag,it.attributes));
		});

		tagPicker.show();
		button.addClass('selected');

		// Update tags to gray out tags which have already been used
		tagPicker.find('a').each(function () {
			$(this).fadeTo(0,1);
			$(this).parent().removeClass('cantSelect');

			var tagid = $(this).attr('data-tagid');
			// If tag has already been used
			if (_.any(me.tags,function (it) {
				return it.id==tagid;
			})) {
				// Gray it out
				$(this).fadeTo(0,0);
				$(this).fadeTo(500,0.3);
				$(this).parent().addClass('cantSelect');
			}
		});

		e.stopPropagation();
	},


	closeTagPicker: function () {
		var tagpicker = $(this.tagPickerEl);
		if (tagpicker.is(":visible")) {
			tagpicker.hide();
		}
		$(".add-label-button").removeClass("selected");
	},


	addTag: function (e) {
		var tagEl = $(e.currentTarget);

		if (tagEl.parent().hasClass('cantSelect')) {
			return;
		}

		var tag = {
			id: tagEl.attr('data-tagid'),
			name: tagEl.text(),
			color: tagEl.attr('data-color')
		};

		this.tags.push(tag);
		this.tidyTags();

		this.renderTags();
		this.closeTagPicker();

		phoneView.changeMade();
	},


	userRemovesTag: function(e) {
		var tagid = $(e.currentTarget).parent().data('tagid');
		this.removeTag(tagid);
		phoneView.changeMade();
	},


	removeTag: function (tagid) {
		this.tags = _.reject(this.tags,function (tag) {
			return tag.id == tagid;
		});
		this.renderTags();
	},


	tidyTags: function () {
		// Sort and remove duplicates, also make sure id is an integer
		this.tags = _.uniq(
			_.sortBy(this.tags,function(b) {
				return b.name;
			}),true,function (it) {
				return it.id;
			});
	},


	// Parse list of this message's tags that are serialized in form
	// and absorb them into collection
	deserializeTags: function () {
		var me = this;
		this.tags = [];
		$("#serializedTags .serializedTag").each(function() {
			tag = {}
			$(this).children('input').each(function () {
				var val = $(this).attr('value');
				tag[$(this).attr('data-name')] = val;
			})
			me.tags.push(tag);
		});
		$("#serializedTags").remove();
		this.tidyTags();
	}

});
