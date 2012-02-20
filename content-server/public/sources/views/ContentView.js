var ContentView = RowView.extend({
	editing: {},
	events: {
		"click .select": "clickedSelect",
		"click .edit-title": "clickedTitle",
		"click .edit-description": "clickedDescription",
		"click .edit-payload": "clickedPayload",
		"click .cancel":"clickedCancel",
		"click .save":"clickedSave",
		"click .edit-type": "clickedType"
	},
	clickedTitle: function (e) {
		this.openEditor('title',e.currentTarget);
	},
	clickedDescription: function (e) {
		this.openEditor('description',e.currentTarget);
	},
	
	clickedPayload: function (e) {
		this.openEditor('payload',e.currentTarget);
	},
	clickedSave: function (e) {
		this.saveEditor('payload');
		e.stopPropagation();
	},
	clickedCancel: function (e) {
		this.closeEditor('payload');
		e.stopPropagation();
	},
	
	
	clickedType: function (e) {
		this.openEditor('type',e.currentTarget);
	},
	clickedSelect: function (e) {
		this.selected.toggle();
	},
	
	updateField: function (fieldName,newValue) {
		
	},
	
	saveEditor: function (fieldName) {
		var object = {};
		var editorEl = $(this.el).find('.editor.'+fieldName);
		var editorValue = editorEl.val();
		object[fieldName]= (fieldName == 'type') ? 
							editorValue.toLowerCase() :
							editorValue;
						
		var me = this;
		this.model.save(object,{
			success: function () {
				me.closeEditor(fieldName);
			}
		});
	},
	closeEditor: function (fieldName) {
		console.log("Closing editor...");
		this.editing[fieldName] = null;
		this.expanded.setOff();
		this.rerender();
		this.collapse()
	},
	openEditor: function (fieldName,element){
		var editorEl = $(this.el).find('.property.'+fieldName);
		if (editorEl.length > 0) {
			console.log("Opening editor...",editorEl);
			this.editing[fieldName] = editorEl.html();
			this.expanded.setOn();
			this.rerender();
			this.expand();
		}
	},
	
	open: function () {},
	render: function () {
		// Call parent function
		RowView.prototype.render.call(this);
		
		// First-time render
		if (!this.originalHeight) {
			this.originalHeight = $(this.el).height();
			$(this.el).height(this.originalHeight);
			this.originalPaddingTop = $(this.el).find(".property").css('padding-top');
			this.originalPaddingBottom = $(this.el).find(".property").css('padding-bottom');

			this.selected = new Toggle(false,this.select,this.deselect);
			this.expanded = new Toggle(false,this.expand,this.collapse);
		}
	},
	
	rerender: function () {
		// Call parent function
		RowView.prototype.rerender.call(this);
		
		$(this.el).height($(this.el).height());
	},
	
	expand: function (callback){
//		$(this.el).find(".property").css({
//			paddingTop: 0,
//			paddingBottom: 0
//		});
//		this.el.stop().animate({
//			height: this.originalHeight+50
//		},200,'swing',callback);
		
	},
	
	collapse: function () {
//		$(this.el).find(".property").css({
//			paddingTop: this.originalPaddingTop,
//			paddingBottom: this.originalPaddingBottom
//		});
//		this.el.stop().animate({
//			height: this.originalHeight
//		},200);
	},
	
	
	select: function () {
		$(this.el).find("input").prop('checked',true);
		$(this.el).addClass('selected');
	},
	deselect: function () {
		$(this.el).find("input").prop('checked',false);
		$(this.el).removeClass('selected');
		
	},
	
	// Override mapping of data into view
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		
		var type = (this.editing.type) ?
					this.markup.type.editor :
					this.markup.type.text;
		map.type = _.template(type,{
			type: map.type
		});
		
		var payload = (this.editing.payload) ?
						this.markup.payload.editor :
							((map.type =='html') ?
							this.markup.payload.html :
							this.markup.payload.text);
		console.log(payload);
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
		inlineEditor: '',
		payload: {
			html:'<pre class="payload property"><code class="html"><%- payload %></code></pre>',
			text:'<span class="payload property"><%- payload %></span>',
			editor: '<textarea class="editor payload"><%- payload %></textarea><a class="save editor">publish</a><a class="cancel editor">cancel</a>'
		},
		type: {
			text: '<a class="type property"><%- type %></a>',
			editor: '<input class="editor type" type="text"/>'
		},
		row: '<li>'+
			'<div class="select checkbox-column section">'+
			'<input type="checkbox"/>'+
			'</div>'+
			'<div class="info-column section">'+
				'<div class="inner-section">'+
				'<strong class="edit-title title property"><%- title %></strong>'+
				'<em class="edit-description description property"><%- description %></em>'+
				'</div>'+
			'</div>'+
			'<div class="edit-payload payload-column section">'+
				'<div class="inner-section">'+
				'<%= payload %>'+
				'</div>'+
			'</div>'+
			'<div class="edit-type type-column section">'+
				'<div class="inner-section">'+
				'<%= type %>'+
				'</div>'+
			'</div>'+
			'</li>'
	}
});
