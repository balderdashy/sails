var ContentView = RowView.extend({
	
	open: function () {
//		alert("I haven't thought about what should happen when this is clicked yet??");
//		window.location='/response/show/'+this.model.get('id');
	},
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		return map;
	},
	markup:{
		row: '<li>thing</li>'
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

var ContentsView = TableView.extend({
	el: '.content-node-list',
	
	// Parse message id from URL for filtering the fetch
	filter: function () {
		return this.message_id
	},
	
	emptyText: 'No responses with attached locations have been posted.',
	
	collectionClass: Contents,
	rowClass:ContentView
});

// Initialize
var contentsView;
contentsView = new ContentsView();