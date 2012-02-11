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

var MessageRecipientView = RowView.extend({
	
	open: function () {
//		window.location='/recipient/show/'+this.model.get('id');
	},
	transform: function (map) {

		// Only transform date if it exists, otherwise it's weird
		if (map.firstResponse == "n/a") {
			map.firstResponse = "N/A";
		}
		else if (map.firstResponse) {
			map.firstResponse = moment(map.firstResponse).from(moment());
			map.notyet = "";
		}
		else {
			map.firstResponse = "No Reply";
			map.notyet = "na";
		}

		// Use filler picture for now:
		map.imgSrc = '/images/anon.png';

		return map;
	},
	markup:{
		row:
		'<tr>'+
	'<td class="image"><img src="{{imgSrc}}"/></td>'+
	'<td class="searchable data"><p>{{recipient}}</p></td>'+
	'<td class="data"><span class="{{notyet}}">{{firstResponse}}</span></td>'+
	'<td class="actionButtons">'+
	'</td></tr>'
	}
});
var MessageRecipient = Row.extend({});
var MessageRecipients = Rows.extend({
	model: MessageRecipient
});

var MessageRecipientsView = TableView.extend({
	// Parse message id from URL for filtering the fetch
	filter: function () {
		return this.message_id
	},
	
	collectionClass: MessageRecipients,
	rowClass:MessageRecipientView
});

// Initialize
var messageRecipientsView;
messageRecipientsView = new MessageRecipientsView();