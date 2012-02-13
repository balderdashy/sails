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

		object[field] = window.prompt("Enter new value");
		object[field]= (field == 'type') ? 
			object[field].toLowerCase() :
			object[field];
		this.saveEditor(object);
	},
	
	open: function () {},
	render: function () {
		// Call parent function
		RowView.prototype.render.call(this);
		
		this.originalHeight = $(this.el).height();
		$(this.el).height(this.originalHeight);
		this.originalPaddingTop = $(this.el).find(".property").css('padding-top');
		this.originalPaddingBottom = $(this.el).find(".property").css('padding-bottom');
		this.selected = new Toggle(false,this.select,this.deselect)
	},
	select: function () {
		$(this.el).find(".property").css({
			paddingTop: 0,
			paddingBottom: 0
		});
		this.el.stop().animate({
			height: "200px"
		},200)
	},
	deselect: function () {
		$(this.el).find(".property").css({
			paddingTop: this.originalPaddingTop,
			paddingBottom: this.originalPaddingBottom
		});
		this.el.stop().animate({
			height: this.originalHeight
		},200,'linear',function() {
//			$(this).removeAttr("style");
		})
	},
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		
		var payload = (map.type =='html') ?
			'<pre class="payload property"><code class="html"><%- payload %></code></pre>' :
			'<span class="payload property"><%- payload %></span>';
		
		map.payload = _.template(payload,{
			payload: map.payload
		});
		
		// Add a prompt for empty tags which are inline
		// (since it would be impossible to add a property to them otherwise)
		map.title = (map.title && map.title.match(/.*\S.*/g)) || "(+)";
		map.description = (map.description && map.description.match(/.*\S.*/g)) || "(+)";
		return map;
	},
	markup:{
		row: '<li>'+
			'<div class="info-column section">'+
				'<div class="inner-section">'+
				'<strong class="title property"><%- title %></strong>'+
				'<em class="description property"><%- description %></em>'+
				'</div>'+
			'</div>'+
			'<div class="payload-column section">'+
				'<div class="inner-section">'+
				'<%= payload %>'+
				'</div>'+
			'</div>'+
			'<div class="type-column section">'+
				'<div class="inner-section">'+
				'<a class="content-type property"><%- type %></a>'+
				'</div>'+
			'</div>'+
			'</li>'
	}
});
