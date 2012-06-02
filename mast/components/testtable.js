Mast.components.TestRow = Mast.Component.extend({
	template: '#mast-template-testtable-row',
	
	events: {
		'click .doDelete': 'removeRow',
		'click': 'toggleRow'
	},
	
	// Called after initialization, before autorender
	init: function () {
	},
	
	changeName: function(formFieldValue) {
		this.set('name',formFieldValue);
	},
	afterRender: function () {
		this.$el.disableSelection();
		
		// Listen for child events
		this.on('dropdownSubmit',this.updateRow);
	},
	
	toggleRow: function(e) {
		var rowModel = this.model;
		if (rowModel.get('highlighted')) {
			//			debug.debug("Dimming row w/ id: "+rowModel.id+" @ index: "+rowId);
			rowModel.set('highlighted',false);
		}
		else {
			//			debug.debug("Highlighting row w/ id: "+rowModel.id+" @ index: "+rowId);
			rowModel.set('highlighted',true);
		}
	},
	
	removeRow: function(e) {
		var rowModel = this.model;
		//		debug.debug("Deleting row w/ id: "+rowModel.id+" @ index: "+rowId);
		this.parent.collection.remove(rowModel);
		rowModel.destroy();
		e.stopImmediatePropagation();
	},
	
	updateRow: function(value) {
		this.set('title',value);
	}
});







Mast.components.TestTable = Mast.Table.extend({
	events: {
		'click .deselectAll': 'deselectAll',
		'click .addRow': 'addRow'
	},
				
	outlet: '.sandbox',
	
	template: '#mast-template-testtable',
	
	rowcomponent: "TestRow",
	
	rowoutlet: '.row-outlet',
	
	collection: "TestRows",
	
	// Called only after the socket is live
	afterConnect: function() {
		// Only fire afterConnect once, even if a reconnect happens
		Mast.Socket.off('connect', this.afterConnect);
		
		var self = this;
		this.collection.fetch({
			error: function(stuff){
				throw new Error(stuff);
			}
		});
	},
	
	addRow: function(e) {
		// Create a random new row
		this.collection.create();
	},
	
	deselectAll: function(e) {
		this.collection.each(function(model){
			model.set('highlighted',false);
		});
	}
});





Mast.components.TestTableWithSubcomponents = Mast.components.TestTable.extend({
	rowcomponent: 'TestRowWithSubcomponent'
});

Mast.components.TestRowWithSubcomponent = Mast.components.TestRow.extend({
	init: function () {
		
		this.set('allowEdit',true);
	},
	subcomponents: {
		dropdown: {
			component: "DropdownComponent",
			outlet: ".doUpdate",
			value: 'test'
		}
	}
});