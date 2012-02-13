var ContentView = RowView.extend({
	events: {
		"click .title": "clickedTitle",
		"click .description": "clickedDescription",
		"click .payload": "clickedPayload",
		"click .content-type": "clickedType"
	},
	clickedTitle: function () {
		alert("edit tiel");
	},
	clickedDescription: function () {
		alert("edit desc");
	},
	clickedPayload: function () {
		alert("edit payload");
	},
	clickedType: function () {
		alert("edit type");
	},
	
	open: function () {},
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		
		var html;
		
		
		html = (map.type=='html') ?
			'<pre class="payload property"><code class="html"><%- payload %></code></pre>' :
			'<span class="payload property"><%- payload %></span>';
		
		map.payload = _.template(html,{
			payload: map.payload
		});
		return map;
	},
	markup:{
		row: '<li>'+
			'<div class="info">'+
			'<strong class="title property"><%- title %></strong>'+
			'<em class="description"><%- description %></em>'+
			'</div>'+
			'<%= payload %>'+
			'<a class="content-type property"><%- type %></a>'+
			'</li>'
	}
});
