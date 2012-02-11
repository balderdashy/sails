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

var MessageCorrespondenceView = RowView.extend({
	open: function () {
//		window.location='/recipient/show/'+this.model.get('recipient_id');
	},
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);

//		// Only transform date if it exists, otherwise it's weird
//		if (map.firstResponse) {
//			map.firstResponse = moment(map.firstResponse).from(moment());
//			map.notyet = "";
//		}
//		else {
//			map.firstResponse = "Not Yet";
//			map.notyet = "na";
//		}

		// Use filler picture for now:
		map.imgSrc = '/images/anon.png';

		return map;
	},
	markup:{
		row:
		'<tr>'+
		'<td class="image"><img src="{{imgSrc}}"/></td>'+
		'<td class="searchable data"><span>{{recipient}}</span></td>'+
		'<td class="searchable data"><span>{{reply}}</span></td>'+
		'<td class="data"><span class="{{notyet}}">{{dateCreated}}</span></td>'+
		'<td class="searchable wide data" ><p>{{label}}</p></td>'+
		'<td class="wide data" ><p>{{dateSent}}</p></td>'+
		'<td class="actionButtons">'+
		'</td></tr>'
	}
});
var MessageCorrespondence = Row.extend({});
var MessageCorrespondences = Rows.extend({
	model: MessageCorrespondence
});

var MessageCorrespondencesView = TableView.extend({
	// Parse message id from URL for filtering the fetch
	filter: function () {
		return this.message_id
	},
	
	emptyText: 'No replies have been posted yet.',
	collectionClass: MessageCorrespondences,
	rowClass:MessageCorrespondenceView
});

// Initialize
var messageCorrespondencesView;
messageCorrespondencesView = new MessageCorrespondencesView();