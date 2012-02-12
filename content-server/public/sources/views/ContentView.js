var ContentView = RowView.extend({
	
	open: function () {
	},
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		return map;
	},
	markup:{
		row: '<li><%- title %></li>'
//		row:
//		'<tr>'+
//		'<td class="image"><img src="{{imgSrc}}"/></td>'+
//		'<td class="searchable data"><span>{{recipient}}</span></td>'+
//		'<td class="data"><span class="{{notyet}}">{{dateCreated}}</span></td>'+
//		'<td class="searchable data"><span>{{latitude}}</span></td>'+
//		'<td class="searchable data"><span>{{longitude}}</span></td>'+
//		'<td class="actionButtons">'+
//		'</td></tr>'
	}
});
