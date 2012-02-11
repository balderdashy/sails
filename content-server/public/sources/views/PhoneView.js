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
 * Message form view for validation
 */
var MessageForm = Backbone.Form.extend({

	el: "#message-editor form",


	model: Backbone.Model.extend({
		initialize: function(obj) {
			this.body = obj;
		},


		defaults: {
			subject: '',
			payload: '',
			isTemplate: false
		},


		rules: {
			subject: "required",
			payload: "required",
			to:{},
			numRecipients: {
				name:"min",
				min:1,
				message:'Please include at least one recipient.',
				displayField: "to"
			}
		}
	})
})


/**
 * Interactive message composer
 */
var PhoneView = Backbone.View.extend({

	el: "html",


	events: {
		"click":"clickOutsideEditor",
		"click #tag-picker":"captureClick",
		"click .openPicker":"openRecipientPicker",
		"click .sendToAll":"sendToAllToggled",
		"click .save-button":"saveButton",
		"click .savecopy-button":"saveCopyButton",
		"click .xml-button":"xmlButton",
		"click .delete-button":"deleteButton",
		"click .send-button":"sendButton",
		"click .add-button":"addButton",
		"keyup #message-editor textarea":"updatePayload",
		"keyup #message-editor input[name='subject']":"updateSubject"
	},


	initialize: function () {
		_.bindAll(this);

		// Set default phone ui
		// changing UI is not supported at this time, rather a stub for later
		this.name = "IPhone";

		// Build button editor
		this.ButtonEditorView = new ButtonEditorView({
			el: $("#button-editor")
		});

		// Build recipient list in form
		this.recipients = new ComposeRecipientsView({
			el: $("#recipient-list")
		});

		// Force an update from the form fields
		this.updateAll();

		// Build message entity to be used in validation
		this.form = new MessageForm();
		this.form.submit = this.submit;
		this.form.error = this.submitFailed;

		// Phone display
		this.buttons = new ButtonsView({
			el: $(this.el).find("ul.buttons"),
			ButtonEditorView: this.ButtonEditorView
		})

		// Set up recipient picker
		this.setupPicker();

		// Build tagview
		this.tagview = new InlineTagsView
	},


	setupPicker: function() {
		this.recipientPicker = new RecipientPicker({
			checkedRecipients: this.recipients.collection,
			checkedGroups: null,
			callback: this.updateRecipients,
			allowNone: true
		});
	},


	// Callback from recipient picker when recipients have been selected (or deselected)
	updateRecipients: function (newRecipientCollection,deletedRecipients,newGroupCollection) {
		// Use new recipient set
		this.recipients.collection.reset(newRecipientCollection.models);
		this.recipients.groupCollection.reset(newGroupCollection.models);
		
		this.recipients.render();
	},


	// Callback from recipient picker after trying to send the message w/ no recips
	updateRecipientsAndSend: function (newRecipientList,deletedRecipients,newGroupList) {
		this.updateRecipients(newRecipientList,deletedRecipients,newGroupList);
		this.submitAs('send');
	},


	// Attempt to close any active dialogs
	clickOutsideEditor: function (e) {
		if (this.ButtonEditorView.el.is(":visible")) {
			this.ButtonEditorView.form.doSubmit();
		}

		this.tagview.closeTagPicker();
	},


	// Change made (from now on, display warning message if the user tries to leave w/o saving/sending)
	changeMade: function () {
		if (!this.changes) {
			this.changes = true;
			// Bind event onbeforeunload to prevent accidental navigation
			$(window).bind('beforeunload', function(event) {
				return "If you leave this page now, your changes will be lost.  Is that OK?";
			});
		}
	},


	// After user clicks on picker icon, display a list of recipients to choose from
	openRecipientPicker: function () {
		this.recipientPicker.buttonLabel = "Save";
		this.recipientPicker.allowNone = true;
		this.recipientPicker.callback = this.updateRecipients;
		this.recipientPicker.show();
	},


	/**
	 * Set the submit type of the form and submit it
	 */
	submitAs: function (name) {
		$(this.form.el).find(".trigger").remove();
		$(this.form.el).append("<input class='trigger' type='hidden' name='"+name+"' value='"+name+"'/>");
		this.form.doSubmit();
	},


	// When user clicks the save button, lift validation restriction
	// surrounding # of recipients
	saveButton: function (e) {
		this.form.liftRule('numRecipients');
		this.submitAs('save');
	},


	// Same thing for save-as-copy
	saveCopyButton: function (e) {
		this.form.liftRule('numRecipients');
		this.submitAs('savecopy');
	},


	// Same thing for delete
	deleteButton: function (e) {
		this.form.liftRule('numRecipients');
		this.submitAs('delete');
	},


	// Same thing for grabbing xml
	xmlButton: function (e) {
		// if this is a new message, prevent clickage
		if (! $("#message-id").val()) {
			alert("Please save or send the message first!");
		}
		else if (this.changes) {
			alert("Please save your changes first!");
		}
		else {
			// otherwise redirect to xml view
			this.form.liftRule('numRecipients');
			this.submitAs('xml');
		}
	},


	// And restore the rule when she clicks "send"
	sendButton: function (e) {
		this.form.imposeRule('numRecipients',{
			name:"min",
			min:1,
			message:'Please include at least one recipient.',
			displayField: "to"
		});
		// Give user the opportunity to choose recipients
		// but only if they have put something in the subject and body fields
		// and nothing in the "To:" field
		if ( $(this.form.el).find(".subject").val()!="" &&
			 $(this.form.el).find(".payload").val()!="" &&
			 this.recipients.collection.length == 0 && !$(this.form.el).find(".sendToAll").is(":checked")) {

			this.recipientPicker.buttonLabel = "Send";
			this.recipientPicker.allowNone = false;
			this.recipientPicker.callback = this.updateRecipientsAndSend;
			this.recipientPicker.show();
		} else {
			this.submitAs('send');
		}
	},


	// When user toggles sendToAll, hide/show as necessary and monitor validation
	// surrounding # of recipients
	sendToAllToggled: function(e) {
		if ($("#recipient-list").hasClass("disabled")) {
			$(".individualRecipients").show();

			$("#recipient-list").removeClass("disabled")
			.removeAttr("disabled");
			$(".numRecipients").val(phoneView.recipients.collection.size());
		}
		else {
			$(".individualRecipients").hide();
			$("#recipient-list").addClass("disabled").attr("disabled","disabled");
			$(".numRecipients").val(1000000);
		}
	},


	// Form submitted
	submit: function(e) {

		// If all the buttons look ok
		var errMsg = this.buttonsError();
		if (errMsg || this.formSubmitted) {
			if (errMsg)
				alert(errMsg);
			else {
				//Log.log("DOUBLE POST BLOCKED");
			}
			return false;
		}
		else {
			// Serialize data
			this.serializeButtons();
			this.serializeRecipients();
			this.serializeTags();

			// Show progress dialog
			$("#sending").dialog('open');

			// Unbind accidental navigation prevention
			$(window).unbind('beforeunload');

			// Mark as submitted-- don't allow another submit until page loads
			// this is here to prevent double posting
			this.formSubmitted = true;
			return true;
		}
	},

	// Form submited, but validation failed.
	submitFailed: function(e) {
		//		Log.log("Submit failed.", e);
	},


	// Check that buttons are formatted correctly
	buttonsError: function () {
		var result = false;

		var buttons = this.buttons.collection;
		buttons.each(function(model,index) {
			var previous = buttons.at(index-1),
			next = buttons.at(index+1)

			if (!model.attributes.longButton) {
				var blockedNext = (next && next.attributes.longButton) || !next,
				blockedPrev = (previous && previous.attributes.longButton) || !previous;
				if (blockedNext && blockedPrev) {
					result = "Please make sure there are no short buttons in a row by themselves.";
				}
			}
		})
		return result;
	},


	// Copy buttons from in-memory collection into form as hidden fields
	serializeButtons: function () {
		var me = this;
		this.buttons.collection.each(function(model) {
			for (var attr in model.attributes) {
				var element = $.stubble(me.markup.hiddenInput,{
					attr: "button." + attr,
					value: model.attributes[attr]
				});
				$("#message-editor form").append(element);
			}
		})
	},


	serializeRecipients: function () {
		var me = this;
		this.recipients.collection.each(function(model) {
			var element = $.stubble(me.markup.hiddenInput,{
				attr: 'recipient',
				value: model.attributes.id
			});
			$("#message-editor form").append(element);
		})
	},


	serializeTags: function () {
		var me = this;
		_.each(this.tagview.tags, function(obj) {
			for (var attr in obj) {
				var element = $.stubble(me.markup.hiddenInput,{
					attr: "tag." + attr,
					value: obj[attr]
				});
				$("#message-editor form").append(element);
			}
		})
	},


	// Add a button to the UI
	addButton: function(e) {
		this.changeMade();
		var result = this.buttons.add();
		if (!result)
			$(".add-button").hide();
		return util.overrideEvent(e);
	},


	// Update phone-mockup ui
	updatePayload: function(e) {
		this.changeMade();
		util.copyText($(e.currentTarget),$('.phone .payload'));
	},


	// Update phone-mockup ui
	updateSubject: function(e) {
		this.changeMade();
		util.copyText($(e.currentTarget),$('.phone .subject'));
	},


	// Render phone view
	updateAll: function () {
		util.copyText($('#message-editor .field.subject'),$('.phone .subject'));
		util.copyText($('#message-editor .field.payload'),$('.phone .payload'));
	},


	deselectAllButtons: function (e) {
		// Ignore safe UI elements
		this.ButtonEditorView.hide();
		this.buttons.deselectAll()
	},


	// Prevent other click actions from firing
	captureClick: function (e) {
		return util.overrideEvent(e);
	},


	markup: {
		hiddenInput: "<input class='hidden-field' type='hidden' name='{{attr}}' value='{{value}}'/>"
	}
	
});


// expose this so that all components can call big daddy phoneview methods
var phoneView;

// Initialize when document is ready
$(function() {
	phoneView = new PhoneView
});

// Immediately initialize UI switcher and tagview
var tagsView = new TagsView();
var uiSwitcher = new PreviewUISwitcherView();