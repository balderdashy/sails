var ContentView = RowView.extend({
	events: {
		"click .select": "clickedSelect",
		"click .edit-title": "clickedTitle",
		"click .edit-description": "clickedDescription",
		"click .edit-payload": "clickedPayload",
		"click .edit-type": "clickedType",
		
		"click .cancel":"clickedCancel",
		"click .save":"clickedSave",
		"change select.type.editor":"selectedFromDropdown",
		"keydown input.editor":"pressedKey"
		
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
		
	clickedType: function (e) {
		this.openEditor('type',e.currentTarget);
	},
	clickedSelect: function (e) {
		this.selected.toggle();
	},
	
	// Finished editing events
	clickedSave: function (e) {
		var fieldName = $(e.currentTarget).attr('data-field');
		this.saveEditor(fieldName);
		e.stopPropagation();
	},
	clickedCancel: function (e) {
		var fieldName = $(e.currentTarget).attr('data-field');
		this.closeEditor(fieldName);
		e.stopPropagation();
	},
	pressedKey: function (e) {
		// If <ENTER> submit button
		var KEY_ENTER = 13, KEY_ESC = 27,
		code = (e.keyCode ? e.keyCode : e.which);
		if (code == KEY_ESC) {
			// User pressed escape
			var fieldName = $(e.currentTarget).attr('data-field');
			this.closeEditor(fieldName);
			e.stopPropagation();
		}
		else if (code != KEY_ENTER || e.shiftKey) {
			// User pressed some other key (or SHIFT+ENTER)
		}
		else {
			// User pressed enter
			var fieldName = $(e.currentTarget).attr('data-field');
			this.saveEditor(fieldName);
			e.stopPropagation();
		}
	},
	selectedFromDropdown: function (e) {
		var fieldName = $(e.currentTarget).attr('data-field');
		this.saveEditor(fieldName);
		e.stopPropagation();
	},
	
	ready: function () {
		this.editing = {};
	},
	
	
	updateField: function (fieldName,newValue) {},
	
	saveEditor: function (fieldName) {
		var object = {};
		var editorEl = $(this.el).find('.editor.'+fieldName);
		var editorValue = editorEl.val();
		object[fieldName]= (fieldName == 'type') ? 
							editorValue.toLowerCase() :
							editorValue;
						
		var me = this;
		this.model.set(object);
		this.model.save({},{
			success: function (response) {
				me.closeEditor(fieldName);
			},
			error: function(response) {
				Log.log("ERROR",response);
			}
		});
	},
	closeEditor: function (fieldName) {
		this.editing[fieldName] = null;
		this.expanded.setOff();
		this.rerender();
		this.collapse()
	},
	openEditor: function (fieldName,element){
		var editorEl = $(this.el).find('.property.'+fieldName);
		if (editorEl.length > 0) {
			Log.log("Opening editor...",editorEl);
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
		
		// Add a prompt for empty tags which are inline
		// (since it would be impossible to add a property to them otherwise)
//		map.title = (map.title && map.title.match(/.*\S.*/g)) || "(+)";
//		map.description = (map.description && map.description.match(/.*\S.*/g)) || "(+)";
		
		
		var title = (this.editing.title) ?
					this.markup.title.editor :
					this.markup.title.text;
		map.title = _.template(title,{
			title:  (map.title && map.title.match(/.*\S.*/g)) || "",
			displayTitle:  (map.title && map.title.match(/.*\S.*/g)) || "(+)"
		});
		
		var description = (this.editing.description) ?
					this.markup.description.editor :
					this.markup.description.text;
		map.description = _.template(description,{
			displayDescription: (map.description && map.description.match(/.*\S.*/g)) || "(Add a description)",
			description: (map.description && map.description.match(/.*\S.*/g)) || ""
		});
		
		var type = (this.editing.type) ?
					this.markup.type.editor :
					this.markup.type.text;
		map.type = _.template(type,{
			type: map.type
		});
		
		var payload = (this.editing.payload) ?
						this.markup.payload.editor :
							((this.model.get('type') =='html') ?
							this.markup.payload.html :
							this.markup.payload.text);
		map.payload = _.template(payload,{
			payload: map.payload
		});
		
		return map;
	},
	markup:{
		payload: {
			html:'<pre class="payload property"><code class="html"><%- payload %></code></pre>',
			text:'<span class="payload property"><%- payload %></span>',
			editor: '<textarea class="editor payload"><%- payload %></textarea>'+
					'<a data-field="payload" class="save editor-btn">publish</a><a data-field="payload"  class="cancel editor-btn">cancel</a>'
		},
		type: {
			text: '<a class="type property"><%- type %></a>',
			editor: '<select data-field="type" class="editor type">'+
					'<option <% if (type=="text") print ("selected"); %> value="text">text</option>'+
					'<option <% if (type=="html") print ("selected"); %> value="html">html</option>'+
					'</select>'
		},
		title: {
			text: '<strong class="edit-title title property"><%- title %></strong>',//'<a class="title property"><%- title %></a>',
			editor: '<input data-field="title" class="editor title" value="<%- title %>" type="text"/>'
		},
		description: {
			text: '<em class="edit-description description property"><%- displayDescription %></em>', //'<a class="description property"><%- description %></a>',
			editor: '<textarea class="editor description" type="text"><%- description %></textarea>'+
					'<a data-field="description" class="save editor-btn">publish</a><a data-field="description" class="cancel editor-btn">cancel</a>'
		},
		row: '<li>'+
			'<div class="select checkbox-column section">'+
			'<input type="checkbox"/>'+
			'</div>'+
			'<div class="info-column section">'+
				'<div class="inner-section">'+
				'<%= title %>'+
				'<%= description %>'+
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
