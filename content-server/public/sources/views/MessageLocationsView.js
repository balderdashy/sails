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

var MessageLocationView = RowView.extend({
	
	open: function () {
//		alert("I haven't thought about what should happen when this is clicked yet??");
//		window.location='/response/show/'+this.model.get('id');
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
		'<td class="data"><span class="{{notyet}}">{{dateCreated}}</span></td>'+
		'<td class="searchable data"><span>{{latitude}}</span></td>'+
		'<td class="searchable data"><span>{{longitude}}</span></td>'+
		'<td class="actionButtons">'+
		'</td></tr>'
	}
});
var MessageLocation = Row.extend({});
var MessageLocations = Rows.extend({
	model: MessageLocation
});

var MessageLocationsView = TableView.extend({
	// Parse message id from URL for filtering the fetch
	filter: function () {
		return this.message_id
	},
	
	emptyText: 'No responses with attached locations have been posted.',
	
	collectionClass: MessageLocations,
	rowClass:MessageLocationView
});

// Initialize
var messageLocationsView;
messageLocationsView = new MessageLocationsView();