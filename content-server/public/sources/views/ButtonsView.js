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

var ButtonsView = Backbone.View.extend({

	selected: null,


	events: {
		'click li.button' : 'selectByClick'
	},


	initialize: function () {
		_.bindAll(this);
		var me = this;
		this.collection = new Buttons

		// On initialization, parse buttons that are serialized in form
		// and absorb them into collection
		var buttons = [];
		$("#serializedButtons .serializedButton").each(function() {
			button = {}
			$(this).children('input').each(function () {
				var val = $(this).attr('value');
				button[$(this).attr('data-name')] = val;
			})
			buttons.push(button);
		});
		$("#serializedButtons").remove();
		buttons = _.sortBy(buttons,function(b) {
			return b.posIndex;
		})

		// Now actually add them
		_.each(buttons,function(b) {
			var newButton = new Button(b)
			me.collection.safeAdd(newButton);
		});
		
		this.render();
	},


	render: function () {
		var buttonlist = this.el;
		buttonlist.find('li.button').remove();
		this.collection.each(this.domInsert)
		// Remove add button if necessary
		if (this.collection.length >= this.collection.max) {
			$(".add-button").hide();
		}
	},


	domInsert: function (b) {
		var buttonlist = this.el
		var view = new ButtonView({
			model: b
		});
		var html = view.render();
		var newElem = $(html).appendTo(buttonlist);

		b.el = newElem;
		view.el = newElem;
		view.delegateEvents();
		return newElem
	},


	add: function (data) {
		// Create model
		var newButton = new Button(data)

		// If it can be saved to collection
		if (this.collection.safeAdd(newButton)) {
			var buttonElement = this.domInsert(newButton);

			// Scroll mobile preview to top so that button is visible
			Log.log("THEEL",this.el.parent());
			this.el.parent().scrollTop(0);

			// Now automatically select the newly created button
			this.selectButton(buttonElement)

			return true;
		}
		else return false;
	},


	selectByClick: function (e) {
		var button=$((e.currentTarget) ? (e.currentTarget) : e);
		var me = this;

		// If editor is open
		if (this.selected) {
			phoneView.ButtonEditorView.form.doSubmit(function() {
				me.selectButton(button)
				return true;
			});
		}
		else {
			this.selectButton(button);
		}
		// Register a change for purposes of displaying a "save your changes message""
		phoneView.changeMade();
		return util.overrideEvent(e)
	},


	selectButton: function (button) {
		this.deselectAll();
		this.selected = button;
		this.highlightButton(button);
	},


	highlightButton: function (button) {
		button.addClass('selected');
		this.options.ButtonEditorView.show()
	},


	deselectAll: function () {
		if (this.selected) {
			this.selected.removeClass('selected');
			this.selected = null;
		}
	},


	deleteButton: function () {
		var button = this.selected,
		model = this.collection.at(button.index());
		this.collection.remove(model)
		this.deselectAll();
		button.remove();
	},


	moveUp: function() {
		this.offset(-1)
	},


	moveDown: function() {
		this.offset(1)
	},


	// Move the selected button up or down
	offset: function (offset) {
		// Be sure and save changes to existing button
		phoneView.ButtonEditorView.updateButton();
		
		var button = this.selected,
		oldIndex = button.index(),
		newIndex = button.index()+offset,
		model = this.collection.at(oldIndex);
		if (newIndex >=0 && newIndex < this.collection.size()) {
			this.collection.remove(model);
			this.collection.add(model,{
				at:newIndex
			})
			this.render()
			this.selectButton(model.el)
		}
	}
	
})