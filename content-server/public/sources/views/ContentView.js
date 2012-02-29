var ContentView = RowView.extend({
	// Keep track of pending XHR requests so they can be aborted if necessary
	xhr: {},

	events: {
		"click .select": "clickedSelect",
		"click .edit-title": "clickedTitle",
		"click .edit-description": "clickedDescription",
		"click .edit-payload": "clickedPayload",
		"click .edit-type": "clickedType",
		
		"click .cancel":"clickedCancel",
		"click .save":"clickedSave",
		"change select.type.editor":"selectedFromDropdown",
		
		"keydown .editor":"pressedKey"
		
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
	
	saveEditor: function (fieldName) {
		var object = {};
		Log.log("FIELDNAME: ",fieldName)
		var editorEl = $(this.el).find('.editor.'+fieldName);
		var editorValue = editorEl.val();
		object[fieldName]= (fieldName == 'type') ? 
							editorValue.toLowerCase() :
							editorValue;
						
		var me = this;
		
		var previousValue = {};
		previousValue[fieldName] = me.model.get(fieldName);
		me.model.busy[fieldName] = true;
		
		// Optional latency for testing
//		window.setTimeout(function() {
			// Cancel existing request
			me.xhr.update && me.xhr.update.abort();
			me.xhr.update = me.model.save(object,{
				success: function (model,response) {
					if (response.success) {
						me.closeEditor(fieldName);
						// Turn off loading animation
						me.model.busy[fieldName] = false;
						me.rerender();
					}
					else {
						Log.log("ERROR",response);
//						me.model.set(previousValue);
						// Turn off loading animation
						me.model.busy[fieldName] = false;
						me.rerender();
						$(me.el).find('.editor.'+fieldName).select();
					}
					
				},
				error: function(model,response) {
					Log.log("ERROR",response);
					
					// Turn off loading animation
					me.model.busy[fieldName] = false;
					me.rerender();
				}
			});
			Log.log(me.xhr.update);
//		},1000);
		
		// Show loading animation
		this.rerender();
	},
	closeEditor: function (fieldName) {
		this.editing[fieldName] = null;
		this.expanded.setOff();
		this.rerender();
		this.collapse()
	},
	openEditor: function (fieldName,element){
		var editeeEl = $(this.el).find('.property.'+fieldName);
		if (editeeEl.length > 0) {
			this.editing[fieldName] = editeeEl.html();
			this.expanded.setOn();
			this.rerender();
			
			var editorEl = $(this.el).find('.editor.'+fieldName);
			$(editorEl).select();
			this.expand();
		}
	},
	
	open: function () {},
	render: function (options) {
		
		// Call parent function
		RowView.prototype.render.call(this,options);
		
		// First-time render
		if (!this.originalHeight) {
			this.originalHeight = $(this.el).height();
			$(this.el).height(this.originalHeight);
			this.originalPaddingTop = $(this.el).find(".property").css('padding-top');
			this.originalPaddingBottom = $(this.el).find(".property").css('padding-bottom');

			this.selected = new Toggle(false,this.select,this.deselect);
			this.expanded = new Toggle(false,this.expand,this.collapse);
		}
		
		// Syntax highlight
		hljs && $('pre code').each(function(i, e) {hljs.highlightBlock(e, '    ')});
	},
	
	rerender: function () {
		this.updateHTML();
		
//		$(this.el).height($(this.el).height());
		
		// Syntax highlight
		hljs && $('pre code').each(function(i, e) {hljs.highlightBlock(e, '    ')});
	},
	
	updateHTML: function () {
		// Call parent function
		RowView.prototype.rerender.call(this);
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
		contentsView.selectedViews.push(this);
		manageContentView.render();
	},
	deselect: function () {
		$(this.el).find("input").prop('checked',false);
		$(this.el).removeClass('selected');
		contentsView.selectedViews = _.without(contentsView.selectedViews,this);
		manageContentView.render();
	},
	
	busyfy: function () {
		this.busy = true;
		this.rerender();
	},
	debusyfy: function () {
		this.busy = false;
		this.rerender();
	},
	
	// Override mapping of data into view
	transform: function (map) {
		// Call parent function
		RowView.prototype.transform.call(this, map);
		
		var title = (this.model.busy.title) ?
					this.markup.title.busy :
					(this.editing.title) ?
					this.markup.title.editor :
					this.markup.title.text;
		map.title = _.template(title,{
			title:  (map.title && map.title.match(/.*\S.*/g)) || "",
			displayTitle:  (map.title && map.title.match(/.*\S.*/g)) || "(Add a title)"
		});
		
		var description = (this.model.busy.description) ?
					this.markup.description.busy :
					(this.editing.description) ?
					this.markup.description.editor :
					this.markup.description.text;
		map.description = _.template(description,{
			displayDescription: (map.description && map.description.match(/.*\S.*/g)) || "(Add a description)",
			description: (map.description && map.description.match(/.*\S.*/g)) || ""
		});
		
		var type = (this.model.busy.type) ?
					this.markup.type.busy :
					(this.editing.type) ?
					this.markup.type.editor :
					this.markup.type.text;
				
		map.type = _.template(type,{
			type: map.type
		});
		
		var payload = (this.model.busy.payload) ?
						this.markup.payload.busy :
						(this.editing.payload) ?
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
			editor: '<textarea data-field="payload" class="editor payload"><%- payload %></textarea>'+
					'<a data-field="payload" class="save editor-btn">publish</a><a data-field="payload"  class="cancel editor-btn">cancel</a>',
			busy: '<img class="spinner" src="/images/ajax-loader-small.gif" />'
		},
		type: {
			text: '<a class="type property"><%- type %></a>',
			editor: '<select data-field="type" class="editor type">'+
					'<option <% if (type=="text") print ("selected"); %> value="text">text</option>'+
					'<option <% if (type=="html") print ("selected"); %> value="html">html</option>'+
					'</select>'+
					'<a data-field="type" class="type cancel editor-btn">cancel</a>',
			busy: '<img class="spinner" src="/images/ajax-loader-small.gif" />'
		},
		title: {
			text: '<strong class="edit-title title property"><%- title %></strong>',//'<a class="title property"><%- title %></a>',
			editor: '<input data-field="title" class="editor title" value="<%- title %>" type="text"/>',
			busy: '<img class="spinner" src="/images/ajax-loader-small.gif" />'
		},
		description: {
			text: '<em class="edit-description description property"><%- displayDescription %></em>', //'<a class="description property"><%- description %></a>',
			editor: '<textarea data-field="description" class="editor description" type="text"><%- description %></textarea>'+
					'<a data-field="description" class="save editor-btn">publish</a><a data-field="description" class="cancel editor-btn">cancel</a>',
			busy: '<img class="spinner" src="/images/ajax-loader-small.gif" />'
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
			'</li>',
		busy: '<li class="busy"><img class="spinner" src="/images/ajax-loader-small.gif" /></li>'
	}
});
