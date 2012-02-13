var ContentView = RowView.extend({
	events: {
		"click .title": "clickedTitle",
		"click .description": "clickedDescription",
		"click .payload": "clickedPayload",
		"click .content-type": "clickedType"
	},
	clickedTitle: function () {
		this.openEditor('title');
	},
	clickedDescription: function () {
		this.openEditor('description');
	},
	clickedPayload: function () {
		this.openEditor('payload');
	},
	clickedType: function () {
		this.openEditor('type');
	},
	
	
	
	
	
	saveEditor: function (object) {
		this.model.save(object,{
			success: this.rerender
		});
	},
	openEditor: function (field){
		var object = {};
		this.selected.toggle();

//		object[field] = window.prompt("Enter new value");
//		object[field]= (field == 'type') ? 
//			object[field].toLowerCase() :
//			object[field];
//		this.saveEditor(object);
	},
	
	open: function () {},
	render: function () {
		// Call parent function
		RowView.prototype.render.call(this);
		
		this.originalHeight = $(this.el).height();
		this.originalPaddingTop = $(this.el).css('padding-top');
		this.originalPaddingBottom = $(this.el).css('padding-bottom');
		this.selected = new Toggle(false,this.select,this.deselect)
	},
	select: function () {
		console.log(this);
		this.el.stop().css({
			paddingTop: 0,
			paddingBottom: 0
		}).animate({
			height: "200"
		},200)
	},
	deselect: function () {
		this.el.stop().css({
			paddingTop: this.originalPaddingTop,
			paddingBottom: this.originalPaddingBottom
		}).animate({
			height: this.originalHeight
		},200)
	},
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		
		var html;
		
		
		html = (map.type =='html') ?
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
