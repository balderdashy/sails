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

// Form for button editor
var ButtonEditorForm = Backbone.Form.extend({
	model: Button,
	validateOnBlur: true,
	el: "#button-editor"
})


// Button Editor
var ButtonEditorView = Backbone.View.extend({

	tagName: 'div',

	model: Button,

	events: {
		"blur .buttonText.field":"blur",
		"click a.move-down": "moveDown",
		"click a.move-up": "moveUp",
		"click .add-button":"addButton",
		"click .done-button":"saveButton",
		'change':'changeAny',
		"change select.buttonType": "changeType",
		"change input.longButton": "changeLongButton",
		"change input.dontTrack": "changeDontTrack",
		"click a.delete":"deleteSelectedButton",
		'keyup input.buttonText':'updateButtonSuperficial',
		"click #buttonAttachmentReplacer" : "showUploader",
		'click input':'captureClickAllowDefault',
		'click a':'captureClickAllowDefault',
		"click": "captureClick",
		"keypress":"pressKey"
	},


	el: "#button-editor",


	initialize: function () {
		_.bindAll(this);
		// Set up form
		this.form = new ButtonEditorForm();
		this.form.submit = this.done
		this.form.validateOnBlur = false;
		// Inform editor of uploader element
		this.uploaderElement = $('#buttonAttachmentUploader');
	},


	startUploader: function () {

		var me = this;
		// Set up and initialize AJAX file uploader
		this.uploaderElement.children().remove();
		// Wipe value to prevent submission
		this.el.find(".buttonValue").val("");


//		// Set up jQuery file uploader
//		this.uploaderElement.append(
//			'<form id="fileupload" action="/ajaxUpload/upload" method="POST" enctype="multipart/form-data">'+
//			'<input id="buttonAttachmentUploaderInput" type="file" name="files[]">'+
//			'</form>');
//		this.uploaderElement.find('#buttonAttachmentUploaderInput').fileupload({
//			url: '/ajaxUpload/upload',
//			limitMultiFileUploads: 1,
//			submit: me.fileSubmitted,
//			done:me.fileFinished
//		})

		// Set up Andrew's file uploader
		this.uploader = new qq.FileUploader({
			maxUploads: 1,
			element: this.uploaderElement.get(0),
			action: '/ajaxUpload/upload',
			params: {
					"messageId": $("#message-id").val()
			},
			multiple: false,
			onComplete: this.fileFinished
		});
	},


//	fileSubmitted: function (e,data) {
//		Log.log("File submitted!",data);
//		this.hideUploader();
//		this.showBusyMessage(data.files[0].fileName);
//	},


	// jQuery File Uploader version
//	fileFinished: function(e,data) {
//		Log.log("Upload complete!",data);
//		var fname = data.originalFiles[0].fileName;
//		if (data.result.success) {
//			if (!phoneView) return;
//			model = this.getModelFromSelected();
//			model.attributes.filename = fname;
//			model.attributes.attachmentId = +data.result.attachmentId;
//			// Save file access url to value field of form
//			this.el.find("input.buttonValue.field").val(data.result.attachmentId);
//			// Replace file uploader UI with a message
//			this.hideUploader();
//			this.showUploadedFile(fname,data.result);
//		}
//		else {
//			// Show error
//			this.hideUploader();
//			this.showError(fname);
//		}
//	},

	// Andrew's Uploader version
	fileFinished: function(id,filename,responseJSON) {
		if (responseJSON.success) {
			if (!phoneView) return;
			var model = this.getModelFromSelected();
			model.attributes.filename = filename;
			model.attributes.attachmentId = +responseJSON.attachmentId;
			model.attributes.value = +responseJSON.attachmentId;
			// Save file access url to value field of form
			this.el.find("input.buttonValue.field").val(model.attributes.attachmentId);
			Log.log("ID WAS: ", model.attributes.attachmentId);
			// Replace file uploader UI with a message
			this.hideUploader();
			this.showUploadedFile(filename,responseJSON);
		}
		else {
			// Show error
			this.hideUploader();
			this.showError(filename);
		}
	},


	showUploader: function (e) {
		this.startUploader();
		e && e.preventDefault();
	},


	showUploadedFile: function (filename,responseJSON) {
		var successMsg = "<div>"+
		"<h2>File attached!</h2>"+
		"<em>"+filename+"</em><br/>"+
		"<a target='_blank' href='/attachment/view/"+responseJSON.attachmentId+"'>View</a>"+
		"&nbsp;&nbsp;"+
		"<a href='#' id='buttonAttachmentReplacer'>Replace</a>"+
		"</div>";
		$(this.uploaderElement).append(successMsg);
	},


	showError: function (filename) {
		var failureMsg = "<div>"+
		"<h2>Error uploading file!</h2>"+
		"<em>"+filename+"</em><br/>"+
		"<a href='#' id='buttonAttachmentReplacer'>Try again</a>"+
		"</div>";
		$(this.uploaderElement).append(failureMsg);
	},


	showBusyMessage: function (filename) {
		var busyMsg = "<div>"+
		"<h2>File uploading...</h2>"+
		"<em>"+filename+"</em><br/>"+
		"<a href='#' id='buttonAttachmentReplacer'>Cancel</a>"+
		"</div>";
		$(this.uploaderElement).append(busyMsg);
	},


	hideUploader: function () {
		Log.log("Hiding uploader:",this.uploaderElement);
		$(this.uploaderElement).children().remove();
	},


	blur: function (e) {
		this.updateButtonSuperficial(e);
		this.updateButton();
	},


	saveButton: function (e) {
		this.updateButton();
		this.form.doSubmit();
		if (e)
			return util.overrideEvent(e);
		else
			return false;
	},


	done: function (e) {
		this.updateButton();
		phoneView.deselectAllButtons();
		return (e && util.overrideEvent(e)) || true;
	},


	moveDown: function (e) {
		phoneView.buttons.moveDown();
	},


	moveUp: function (e) {
		phoneView.buttons.moveUp();
	},


	addButton: function (e) {
		this.updateButton();
		this.form.doSubmit(function() {
			phoneView.addButton(e);
			return true;
		});
		return util.overrideEvent(e);
	},


	// Reflect button editor changes in phone UI
	updateButtonSuperficial: function(e) {
		var button = phoneView.buttons.selected;
		if (button) {
			util.copyText($(e.currentTarget),button.children('a'));
			util.copyText($(e.currentTarget),$("#sample-button a"));
		}
	},


	// Actually update the backbone models
	updateButton: function() {
		if (!phoneView) return;
		var button = phoneView.buttons.selected,
		model = this.getModelFromSelected();
		if (model) {
			model.set({
				label: button.text(),
				type: this.el.find(".buttonType").val(),
				value: this.el.find(".buttonValue").val(),
				longButton:
				(this.el.find(".longButton.field").is(":checked")) ? 1 : 0,
				external:
				(this.el.find(".external.field").is(":checked")) ? 1 : 0,
				dontTrack:
				(this.el.find(".dontTrack.field").is(":checked")) ? 1 : 0,
				includeLocation:
				(this.el.find(".includeLocation.field").is(":checked")) ? 1 : 0,
				textEntry:
				this.el.find(".textEntry.field").val(),
				extraData:this.el.find(".extraData.field").val()
			})
		}
	},


	// Look up the model based on the index of the selected DOM button
	getModelFromSelected: function (){
		var button = phoneView.buttons.selected;
		if (button)
			return phoneView.buttons.collection.at(button.index());
		else return null;
	},


	// If any input is changed, update button model, and then
	// stop propogation so the click squasher isn't fired
	changeAny: function (e) {
		this.updateButton();
	},


	// If type is changed, rerender form
	changeType: function(e) {
		this.updateButton();
		this.show();
		
		// if this is a file upload, the value should be derived from the attachmentId
		if (this.el.find('.field.buttonType').val() == 'openFile') {
			this.el.find('input.buttonValue').val(this.el.find('input.attachmentId'));
		}
		// if this is a poll, the value should be filled with a dummy string
		else if (this.el.find('.field.buttonType').val() == 'answerPoll') {
			this.el.find('input.buttonValue').val("pollresponse");
		}
		// otherwise wipe value field
		else {
			this.el.find('input.buttonValue').val('');
		}
	},


	// If longButton is changed, rerender form
	changeLongButton: function(e) {
		this.updateButton();
		if ($(e.currentTarget).hasClass('disabled')) {
			$(e.currentTarget).prop("checked",true);
		}
		else {
			this.render();
		}
	},


	changeDontTrack: function(e) {
		this.updateButton();
		this.render();
	},


	// Triggered when user presses a key
	pressKey: function (e) {
		// If <ENTER> submit button
		var KEY_ENTER = 13, KEY_ESC = 27,
		code = (e.keyCode ? e.keyCode : e.which);
		if (code != KEY_ENTER || e.shiftKey) {
			return true;
		}
		else {
			// User pressed enter
			this.form.doSubmit();
			return util.overrideEvent(e);
		}
	},


	// Render the button editor, do animations, and select the first input
	show: function () {
		this.render();

		// Hide xml button for now
		$(".xml-button").hide();

		// Show interface
		this.el.fadeIn(200,function() {
			// Automatically select first input for convenience
			$("input.field.buttonText").select();
		});
		$("#message-editor").fadeOut(150);
		$("#message-tag-editor").fadeOut(150);
		$("#navbar").hide(150);
		$("#header").hide(150);
		$("#breadcrumb").hide(150);
		$("#thin-pane").hide(150);
		$("#layout-header").hide(150);
		$(".aboveMessage").hide(150);
	},

	
	hide: function () {
		// Show XML button again
		$(".xml-button").show();
		this.el.fadeOut(150);
		$("#message-tag-editor").fadeIn(150);
		$("#message-editor").fadeIn(150);
		$("#navbar").show(150);
		$("#header").show(150);
		$("#breadcrumb").show(150);
		$("#thin-pane").show(150);
		$("#layout-header").show(150);
		$(".aboveMessage").show(150);
	},


	// Render the button editor
	render: function () {

		// Remove all validation errors
		this.form.reset();
		// Remove phone number autoformat
		phoneNumberField = this.el.find('input.buttonValue');
		phoneNumberField.unbind('keyup',PhoneNumber.formatPhone);
		phoneNumberField.unbind('keydown',PhoneNumber.storeSubKey);
		// Adjust form depending on type
		var button = phoneView.buttons.selected;
		var model = phoneView.buttons.collection.at(button.index());
		var newLabel,newDesc,typeDesc,valuePlaceholder,labelPlaceholder = '';
		switch (model.attributes.type) {
			case "displayUrl":
				newLabel="URL";
				newDesc="URL to open when the button is pressed";
				typeDesc="Display a URL.";
				valuePlaceholder="http://unwirednation.com";
				labelPlaceholder="Learn More";
				break;
			case "answerPoll":
				newLabel="Candidate A";
				newDesc="";
				typeDesc="Answer a poll with a one-time response.";
				valuePlaceholder="";
				labelPlaceholder="Learn More";
				break;
			case "reply":
				newLabel="Prompt Text";
				newDesc="A prompt the recipient will see when replying.";
				typeDesc="Prompt recipient for a reply.  You can review these responses on the Reports page.";
				valuePlaceholder="What's on your mind?";
				labelPlaceholder="Reply";
				break;
			case "displayMessage":
				newLabel="Message";
				newDesc="Message to display when the button is pressed";
				typeDesc="Display a message.";
				valuePlaceholder="Response received!";
				labelPlaceholder="Acknowledge Message";
				break;
			case "openFile":
				newLabel="";
				newDesc="";
				typeDesc="Open the attached file on the user's mobile device.";
				valuePlaceholder="";
				labelPlaceholder="View Attachment";

				// Refresh file uploader
				if (!model.attributes.filename) {
					this.showUploader();
				}
				else if (model.attributes.value && model.attributes.value != "") {
					var filename = model.attributes.filename;
					Log.log("GRABBING value, attachment ID,filename",model.attributes.value, model.attributes.attachmentId,filename);
					this.hideUploader();
					// Save file access url to value field of form
					this.el.find("input.buttonValue.field").val(model.attributes.attachmentId);
					model.attributes.value = model.attributes.attachmentId;
					this.showUploadedFile(filename,{
						status: 'success',
						attachmentId: model.attributes.attachmentId
					});
				}
				break;
			case "phoneCall":
				newLabel="Phone number";
				newDesc="Number to dial when the button is pressed"
				typeDesc="Dial a phone number."
				valuePlaceholder="(555)-555-5555";
				labelPlaceholder="Call Office";
				// format phone number
				phoneNumberField = this.el.find('input.buttonValue');
				phoneNumberField.keyup(PhoneNumber.formatPhone);
				phoneNumberField.keydown(PhoneNumber.storeSubKey);

				break;
			case "postResponse":
				newLabel="URL";
				newDesc="URL where response will be posted";
				typeDesc="Send a POST response from the message recipient to a URL."
				valuePlaceholder="http://customer.me/responseHandler"
				labelPlaceholder="Custom Response";
				break;
			default:
				throw new Error ("Unknown message type:"+model.attributes.type);
		}
		$(".buttonValueLabel").text(newLabel);
		$(".buttonValueDesc").text(newDesc);
		$(".buttonTypeDesc").text(typeDesc);
		this.el.find('input.buttonValue').attr('placeholder',valuePlaceholder);
		this.el.find('input.buttonText').attr('placeholder',labelPlaceholder);
		// Adjust view for long button
		if (model.attributes.longButton) {
			maxLength = 40;
			button.addClass('long');
			$("#sample-button").addClass('long');
		}
		else {
			maxLength = 20;
			button.removeClass('long');
			$("#sample-button").removeClass('long');
		}
		// Adjust maxLength and sample button text
		$("input.buttonText.field").attr('maxLength',maxLength);
		$("#sample-button a").text(model.attributes.label);

		// Populate editor information with button data
		// First the text fields
		var inputButtonText = this.el.find("input.buttonText").val(model.attributes.label);
		this.el.find("input.buttonValue.field").val(model.attributes.value);
		this.el.find("select.buttonType.field").val(model.attributes.type);
		this.el.find("textarea.textEntry.field").val(model.attributes.textEntry);
		this.el.find("textarea.extraData.field").val(model.attributes.extraData);

		// Long button logic
		var longButtonCheckbox = this.el.find("input.longButton.field");
		var buttonIndex = button.index();
		var numButtons = phoneView.buttons.collection.length;
		var next = phoneView.buttons.collection.at(buttonIndex+1);
		var previous= phoneView.buttons.collection.at(buttonIndex-1);
		var me= phoneView.buttons.collection.at(buttonIndex);

		// calculate whether longbutton input should be disabled
		var longButtonDisabled = false;

		if (longButtonDisabled) {
			longButtonCheckbox.addClass("disabled");
		}
		else
			longButtonCheckbox.removeClass("disabled");
		longButtonCheckbox.prop("checked",model.attributes.longButton);

		// then the other checkboxes
		this.el.find("input.external.field").prop("checked",model.attributes.external);
		this.el.find("input.includeLocation.field").prop("checked",model.attributes.includeLocation);
		this.el.find("input.dontTrack.field").prop("checked",model.attributes.dontTrack);

		// reset type-dependent fields
		var type = model.attributes.type;
		this.el.find("div.conditional").hide();
		this.el.find("div."+type).show();

		// Deal with the external flag not being in the postResponse options
		if (model.attributes.dontTrack) {
		}
		else
			this.el.find('div.external').hide();
	},


	deleteSelectedButton: function (e) {
		phoneView.buttons.deleteButton();
		this.hide();
		$(".add-button").show();
		return util.overrideEvent(e);
	},


	captureClick: function (e) {
		return util.overrideEvent(e);
	},


	captureClickAllowDefault: function (e) {
		e.stopImmediatePropagation();
		return true;
	}
})