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

var RecipientChoiceView = Backbone.View.extend({

	// Toggleable state variable
	selected: null,

	initialize: function(params) {
		_.bindAll(this);
		this.model = params.model;
		
		// Set up toggle
		this.selected = (new Toggle(false,this.select,this.deselect));
		
		this.collectionView = params.collectionView;
		this.pickerView = params.pickerView || this.collectionView.collectionView;
		this.render();
	},

	events: {
		"click li a":"selectRecipient"
	},

	generateHTML: function () {
		var map = {
			name:this.model.attributes.name,
			imgSrc: '/images/anon.png'
			
//			// TODO: Add first in row class for display logic
//			firstInRow: (this.index % 3 == 0) ? "first" : ""
		}
		return $.stubble(this.markup,map);
	},

	render: function () {
		var newElem = $(this.generateHTML()).appendTo(this.collectionView.collectionEl);
		this.el = newElem;

		// Select recipient if specified by server
		var checked = this.pickerView.checkedRecipients,
			recipientChecked = checked.get(this.model.attributes.id),
			groupChecked = this.collectionView.model && this.pickerView.checkedGroups.get(this.collectionView.model.attributes.id);
		if (recipientChecked || groupChecked) {
			this.select();
		}

		this.delegateEvents();
	},

	select: function () {
		
		var newInput = this.el.find('input');
		newInput.prop("checked",true);
		newInput.parent().addClass('selected');
		this.pickerView.checkedRecipients.add(this.model);
		this.selected.setOn();
	},

	deselect: function () {
		var newInput = this.el.find('input');
		newInput.prop("checked",false);
		newInput.parent().removeClass('selected');
		this.pickerView.checkedRecipients.remove(this.model);
		this.selected.setOff();
		
		// Deselect select all checkbox if it's selected
		if ($("#selectAllRecipients").is(":checked")) {
			$("#selectAllRecipients").prop("checked",false);
		}

		// Deselect this recipients group if it was selected
		if (this.collectionView.selected) {
			this.collectionView.deselect();
		}
	},


	selectRecipient: function (e) {
		this.selected.toggle();
		
		// Update save button
		this.pickerView.updateSaveButton();
	},

	markup:
		"<li class='recipient'>"+
		"<a class='recipient'><input type='checkbox'/>"+
		"<img src='{{imgSrc}}' alt={{name}}/><span>{{name}}</span>"+
		"</a>"+
		"</li>"


//	renderRecipient: function (index,recipient) {
//
//		// First establish if this recipient belongs to an existing group
//		// or if a new group needs to be created
//		if (recipient.group) {
//
//		}
//		else {
//
//		}
//
//		// Allow grabbing existing recipient list from server response
//		var recipientsFromServer = this.checked;
//
//		var recipientEl = $($.stubble(this.markup.recipient,{
//			name: recipient.name,
//			imgSrc: '/images/anon.png',
//			id: recipient.id
//		})).appendTo(".recipient-grid");
//
//		var myInput = recipientEl.find('input');
//		myInput.data('name',recipient.name);
//		myInput.data('id',recipient.id);
//
//		// If this recipient id has already been selected, check this item
//		// (and a recipient source was specified)
//		if (this.recipients) {
//			if (this.recipients.get(recipient.id)) {
//
//				// Use this if unchecking recipients should be disabled
//				if (this.deselectDisabled) {
//					recipientEl.addClass('disabled');
//					myInput.addClass('disabled');
//				}
//				myInput.prop("checked",true);
//				myInput.parent().addClass('selected');
//			}
//		}
//		else if (recipientsFromServer) {
//			if (_.contains(_.pluck(recipientsFromServer,'id'),recipient.id) ) {
//
//				// Use this if unchecking recipients should be disabled
//				if (this.deselectDisabled) {
//					recipientEl.addClass('disabled');
//					myInput.addClass('disabled');
//				}
//
//				// Select recipient
//				myInput.prop("checked",true);
//				myInput.parent().addClass('selected');
//			}
//		}
//
//		// Add first in row class for display logic
//		if (index % 3 == 0)
//			recipientEl.addClass("first");
//	},

})
