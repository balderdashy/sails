// A Table is a special Component that may handle events for a
// homogenous collection of child components.
// 
// It also provides an API for performing CRUD operations on that
// collection, both on the clientside and over the Socket using
// Backbone REST-style semantics.
Mast.OldTable = {
			
	initialize: function (attributes,options,dontRender){
				
		// Initialize main component
		Mast.Component.prototype.initialize.call(this,attributes,options,true);
				
		_.bindAll(this);
				
		_.extend(this,attributes);
				
		// Watch for and announce statechange events
		this.on('afterRenderRow',this.afterRenderRow);
				
		// Watch for collection changes
		var self = this;
		this.collection.on('remove',function() {
			self.render();
		});
		this.collection.on('change',function(model) {
			//					console.log("CHANGE!");
			self.renderRow(model);
		});
		this.collection.on('add',function() {
			//					console.log("ADD fired!");
			self.render();
		});
		this.collection.on('reset',function() {
			self.render();
		});
				
		// Verify rowtemplate
		if (!this.rowtemplate) {
			throw new Error("No rowtemplate specified!");
		}
				
		// Autorender is on by default
		// Default render type is "append", but you can also specify "replaceOutlet""
		if (!dontRender && this.autorender!==false) {
			if (this.replaceOutlet) {
				this.replace()
			}
			else {
				this.append();
			}
		}
				
	},
			
	// Render the Table, its subcomponents, and all rows
	render: function (silent) {
		// Render main pattern
		Mast.Component.prototype.render.call(this,true);
				
		// Determine and verify row outlet
		if (!this.rowoutlet) {
			// If no rowoutlet is explicitly specified,
			// just append the row elements to this.$el
			this.$rowoutlet = this.$el;
		}
		else {
			// Otherwise use the rowoutlet selector to find
			// the row outlet element inside of this.$el
			this.$rowoutlet = this._verifyOutlet(this.rowoutlet,this.$el);
		}
				
		// Empty and append rows to the outlet
		this.$rowoutlet.empty();
		if (this.collection.length > 0 ){
			this._appendRows();
		}
		else {
			this.$rowoutlet.append(this._generateEmptyHTML());
		}
				
		// Listen for row DOM events and redelegate events
		this._listenToRows();
		this.delegateEvents();
				
		if (!silent) {
			this.trigger('afterRender');
		}
	},
			
	// Render the given row in place
	renderRow: function (model,status) {
		this._replaceRow(this.collection.indexOf(model),this._generateRowElement(model));
	},
			
	// Lookup the element for the id'th row
	getRowEl: function (id) {
		return this.getRowsEl().eq(id);
	},
			
	// Lookup $ set of all rows
	getRowsEl: function () {
		return this.$rowoutlet.children();
	},

	// Update and render patterns from collection
	_appendRows: function() {
		// Update and render patterns from collection
		var self = this;
		this.collection.each(function(model,index){
					
			// Append the row
			var el = self._generateRowElement(model);
			self._appendRow(el);
		});
	},
			
	// Delegate row events
	_listenToRows: function () {
		_.each(this.rowevents,function(fn,ev) {
			var delegateEventSplitter = /^(\S+)\s*(.*)$/;
			var match = ev.match(delegateEventSplitter);
			var eventName = match[1], selector = match[2];
					
					
			// Inject row CSS class selector
			ev = eventName + 
			" ." + Mast.rowCSSClass+
			((selector) ? (" " + selector) : "");
					
			if (!_.isFunction(fn)) {
				fn = this[fn];
			}
					
			var handler = function(e) {
				var index = this._getRowIndexFromEvent(e);
				return fn(index,e);
			};
			handler = _.bind(handler,this);
			this.events[ev] = handler;
		},this);
	},
			
	// Append newly generated row element to rowoutlet
	_appendRow: function($el){
		this.$rowoutlet.append($el);
		this.trigger('afterRenderRow',$el.index());
	},
			
	// Replace the given row with the new element
	_replaceRow: function(id,$el){
		var oldEl = this.getRowEl(id);
		oldEl.replaceWith($el);
		this.trigger('afterRenderRow',$el.index());
	},
			
	// Generate element and add CSS identifier class
	_generateRowElement: function (model) {
		var pattern = new Mast.Pattern({
			template: this.rowtemplate,
			model: model
		});
		var $element = $(pattern.generate());
		return $element.addClass(Mast.rowCSSClass);
	},
			
	// Generate empty table html
	_generateEmptyHTML: function () {
		if (this.emptytemplate) {
			var pattern = new Mast.Pattern({
				template: this.emptytemplate
			});
			return $(pattern.generate());
		}
		else {
			return $(this.emptyHTML);
		}
	},
			
	// Given the event object, return the index of this row's element
	_getRowIndexFromEvent: function (e) {
		//				console.log("?",e,$(e.currentTarget).is('.'+Mast.rowCSSClass),$(e.currentTarget).parents('.'+Mast.rowCSSClass),$(e.currentTarget),$(e.currentTarget).index());
		var $target = $(e.currentTarget),
		rowSelector = '.'+Mast.rowCSSClass;
					
		if ($target.is(rowSelector)) {
			return $target.index();
		}
		else {
			var $targetRow = $target.parentsUntil($(e.delegateTarget),rowSelector);
			if (!$targetRow) {
				throw new Error("Invalid row structure!  Couldn't select a row in this delegate.");
			}
			return $targetRow.index();
		}
				
	},
			
	_getRowIndexFromEl: function (el) {
		var $target = $(el);
		return $target.index();
	}
}