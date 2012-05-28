// A Table is a special Component that may handle events for a
// homogenous collection of child components.
// 
// It also provides an API for performing CRUD operations on that
// collection, both on the clientside and over the Socket using
// Backbone REST-style semantics.
Mast.Table = {
			
	initialize: function (attributes,options,dontRender){
				
		// Initialize main component
		Mast.Component.prototype.initialize.call(this,attributes,options,true);
				
		_.bindAll(this);
				
		_.extend(this,attributes);
				
				
		// Watch for collection changes
		var self = this;
		this.collection.on('remove',function(model,collection,status) {
			self.removeRow(model,status.index);
		});
		this.collection.on('add',function(model) {
			//					console.log("ADD fired!",a,b);
			self.appendRow(model);
		});
		this.collection.on('reset',function() {
			self.render();
		});
				
		// Verify rowtemplate or component
		if (!this.rowtemplate && !this.rowcomponent) {
			throw new Error("No rowcomponent or rowtemplate specified!");
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
		//		this._listenToRows();
		this.delegateEvents();
				
		if (!silent) {
			this.trigger('afterRender');
		}
	},
			
	
	
	appendRow: function (model) {
		// If this is the first row, empty the emptyHTML element
		if (this.collection.length == 1) {
			this.$rowoutlet.empty();
		}
		
		var r = new Mast.components[this.rowcomponent]({
			parent: this,
			model: model,
			outlet: this.rowoutlet
		});
		r.append();
	},
	
	removeRow: function (model,index) {
		this.getRowEl(index).remove();
		if (this.collection.length == 0 ) {
			this.$rowoutlet.append(this._generateEmptyHTML());
		}
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
			// Append row component
			_.defer(function() {
				var r = new Mast.components[self.rowcomponent]({
					parent: self,
					model: model,
					outlet: self.rowoutlet
				});
				r.append();
			});
		});
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
	}
}