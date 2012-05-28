Mast.components.TestRow = Mast.Component.extend({
//	autorender:false,
	template: '#mast-template-testtable-row',
	
	events: {
		'click .doDelete': 'removeRow',
		'click': 'toggleRow'
	},
	
	removeRow: function(e){
		debug.debug("REMOVE");
		e.stopImmediatePropagation();
	},
	
	toggleRow: function(e){
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
		e.stopImmediatePropagation();
	}
});




Mast.components.TestTable = Mast.Table.extend({
	autorender:false,
	
	events: {
//		'click .deselectAll': 'deselectAll',
		'click .addRow': 'addRow'
	},
				
	
	// Called only after the socket is live
	afterConnect: function() {
		Mast.Socket.off('connect', this.afterConnect);
		var self = this;
		this.collection.fetch({
			error: function(stuff){
				throw new Error(stuff);
			}
		});
	},
	
	outlet: '.sandbox',
	
	template: '#mast-template-testtable',
	
	rowcomponent: 'TestRow',
	
	rowoutlet: '.row-outlet',
	
	collection: new Mast.models.TestRows(),
	
	addRow: function(e) {
		// Create a random new row
		this.collection.create({
			title: 'Sample',
			value: Math.floor(Math.random()*5000),
			highlighted: false
		});
	}
})


//Mast.components.TestTableOld = Mast.OldTable.extend({
//					
//	autorender: false,
//			
//	emptytemplate: '#mast-template-testtable-empty',
//			
//	// Called only after the socket is live
//	afterConnect: function() {
//		Mast.Socket.off('connect', this.afterConnect);
//		var self = this;
//		this.collection.fetch({
//			error: function(stuff){
//				throw new Error(stuff);
//			}
//		});
//	},
//					
//	events: {
//		'click .deselectAll': 'deselectAll',
//		'click .addRow': 'addRow'
//	}
//					
//	// Row events are triggered when any of the
//	// child rows fire a DOM event
//	, 
//	rowevents: {
//		'click .doDelete': 'removeRow',
//		'click': 'toggleRow'
//	}
//					
//	, // Template for this Table
//	template: '#mast-template-testtable'
//					
//	, // Model is optional
//	model: null
//					
//	, 
//	outlet: '.sandbox'
//			
//	, 
//	collection: new Mast.models.TestRows()
//					
//	, 
//	rowtemplate: '#mast-template-testtable-row'
//					
//	, 
//	rowoutlet: '.row-outlet'
//			
//	, 
//	deselectAll: function(e) {
//		this.collection.each(function(model){
//			model.set('highlighted',false);
//		});
//	}
//			
//	,
//	addRow: function(e) {
//		// Create a random new row
//		function generateSampleRow (){
//			return new Mast.Model({
//		
//				title: 'Sample',
//				value: Math.floor(Math.random()*5000),
//				highlighted: false
//			});
//		}
//		var model = generateSampleRow(this.collection.length);
//		this.collection.create(model);
//	}
//			
//	, 
//	toggleRow: function(rowId, e){
//		var rowModel = this.collection.at(rowId);
//		if (rowModel.get('highlighted')) {
//			debug.debug("Dimming row w/ id: "+rowModel.id+" @ index: "+rowId);
//			rowModel.set('highlighted',false);
//		}
//		else {
//			debug.debug("Highlighting row w/ id: "+rowModel.id+" @ index: "+rowId);
//			rowModel.set('highlighted',true);
//		}
//	}
//			
//	,
//	removeRow: function(rowId,e) {
//		var rowModel = this.collection.at(rowId);
//		debug.debug("Deleting row w/ id: "+rowModel.id+" @ index: "+rowId);
//		this.collection.remove(rowModel);
//		e.stopImmediatePropagation();
//	}
//			
//	,
//	// Triggered after rendering the entire table
//	afterRender: function() {
//	}
//			
//	// Triggered after rendering each row
//	,
//	afterRenderRow: function(rowId) {
//		// Disable selection on all child rows
//		this.$rowoutlet.children().eq(rowId).disableSelection();
//				
//	}
//});