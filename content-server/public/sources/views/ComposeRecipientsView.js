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

var ComposeRecipientsView = Backbone.View.extend({

	initialize: function() {
		_.bindAll(this);
		this.collection = new Recipients;
		this.groupCollection = new Groups;
		$(this.domReady);
	},


	domReady: function () {
		this.parse();
		this.render();
	},


	// Parse recipients that are serialized in form
	// and absorb them into collection
	parse: function () {		
		// If 'send to all' was checked, do that instead of fetching individuals
		if (+($("#startedWithSendToAll").val()) == 1) {
			$(".sendToAll").click();
		}
		else {
			_.each($("#serializedRecipients .serializedRecipient"),function(elem) {
				var recipientAttrs = {}
				_.each($(elem).children('input'),function (elem) {
					recipientAttrs[$(elem).attr('data-name')] = $(elem).attr('value');
				},this);
				this.collection.add(new Recipient(recipientAttrs));
			},this);
		}
		$("#serializedRecipients").remove();
	},


	render: function () {
//		Log.log("Rendering ComposeRecipientsView...",this.collection);
		
		$(this.el).empty();
		this.collection.each(function(recipient,index) {
			new ComposeRecipientView({
				model: recipient,
				collectionView: this
			});
		},this)

		// Update in-form recipient count
		$("#numRecipients").val(this.collection.length);
	},


	add: function (obj) {
		if (this.collection.add(new Recipient(obj,this.el))) {
			this.render();
			return true;
		}
		else return false;
	}

});
