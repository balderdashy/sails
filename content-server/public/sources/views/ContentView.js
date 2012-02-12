var ContentView = RowView.extend({
	
	open: function () {
	},
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		return map;
	},
	markup:{
		row: '<li>'+
			'<strong class="title property"><%- title %></strong>'+
			'<span class="payload property"><%- payload %></span>'+
			'<a class="content-type property"><%- type %></a>'+
			'</li>'
	}
});
