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


var ResponseView = RowView.extend({
	open: function () {
		window.location='/message/summary/'+this.model.get('message_id');
	},
	markup:{
		row:
		'<tr>'+
		'<td class="searchable wide data" ><p>{{recipient}}</p></td>'+
		'<td class="dateCreated data">{{dateCreated}}</td>'+
		'<td class="searchable wide data" ><p>{{subject}}</p></td>'+
		'<td class="searchable wide data" ><p>{{label}}</p></td>'+
		'<td class="wide data" ><p>{{dateSent}}</p></td>'+
		'<td class="actionButtons">'+
		'</td></tr>'
	}
});