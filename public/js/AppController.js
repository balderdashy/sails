// Create a random new row
function generateSampleRow (x){
	return new Mast.Model({
		id: x,
		title: 'Sample',
		value: Math.floor(Math.random()*5000),
		highlighted: false
	});
}		

var TestRows = Mast.Collection.extend({
	
	});
		
var testtableRowCollection = new TestRows([
	generateSampleRow(0),
	generateSampleRow(1),
	generateSampleRow(2),
	generateSampleRow(3)
	]);



// Define routes
var AppController = {
			
	// Default route
	index: function(query,page) {
				
		// Empty container
		$(".sandbox").empty();
				
		// Define a reusable dropdown component
		DropdownComponent = Mast.Component.extend({
			template: '.dropdown',
			events: {
				click:'openMenu'
				, 
				clickoutside: 'closeMenu'
			},
			init: function() {
			//
			},
			openMenu: function(e){
				debug.debug("Opened menu.");
				this.pattern.setTemplate('.dropdown-expanded');
				e.stopImmediatePropagation();
			},

			closeMenu: function () {
				debug.debug("Closed menu.");
				this.pattern.setTemplate('.dropdown');
			},

			// Triggered after each render
			afterRender: function () {}
		});

		// Create some components
		a=new Mast.Component({
			events: {},

			// Subcomponents to register
			subcomponents: [
			{
				component: DropdownComponent,
				outlet: ".ddown"
			},
			{
				component: DropdownComponent,
				outlet: ".ddown"
			}
			],

			model: new Mast.Model({
				name:'THING1 rendered!  Appended a dropdown component as well.'
			}),

			template: '.test',

			outlet:'.sandbox',

			// Triggered after each render
			afterRender: function () {
				this.$el.draggable();
			}
		});	

		b=new Mast.Component({

			// Subcomponents to register
			subcomponents: [
			{
				component: DropdownComponent,
				outlet: ".ddown"
			}
			],

			pattern: new Mast.Pattern({
				model: new Mast.Model({
					name:'te1'
				}),
				template: '.test'
			}),

			outlet:'.sandbox',

			// Triggered after each render
			afterRender: function () {
				this.$el.draggable();
			}
		});


		// When you create a new Component, it renders to the DOM automatically
		// And subsequently, you don't have to force a component to render-- 
		// it'll do it on its own when its Pattern (template or model) changes.


		// First, let's try changing the model
		// an event is created at the model and bubbles up to the view
		a.pattern.set('name','Changed THING1\'s model.');
		b.pattern.model.set('name','Changed THING2\'s model.');


		// Now let's change the template-- notice how the DOM automatically updates
		// This is great for instances when a whole bunch of HTML needs to change 
		a.pattern.setTemplate('.test1');
		b.pattern.setTemplate('.test1');

		// You can render components as many times as you want!
		a.render();
		a.render();
		a.render();
		a.render();
		a.render();
				
		// OK that was fun-- so lets move on to another example
		// We'll create a "Next Example" link
		// which will use the Mast.Router to manage the browser history stack
		// and move on to the next stage of the example app
		new Mast.Component({
			events: {
				click: function(e) {
					Mast.navigate('tableExample');
				}
			},
			template: '#mast-template-button',
			model: new Mast.Model({
				label: 'Next experiment >'
			}),
			outlet: '.sandbox'
		});
	},
			
			
	tableExample: function(query,page){
			
		// Empty container
		$(".sandbox").empty();
				
		// Now let's try creating a Table
		// A Table is basically just a Component which contains 
		// a homogenous list of sub-Components
		t = new Mast.Table({
					
			autorender: false,
					
			events: {
				'click .deselectAll': 'deselectAll'
			}
					
			// Row events are triggered when any of the
			// child rows fire a DOM event
			, 
			rowevents: {
				'click .doDelete': 'deleteRow'
				,'click': 'toggleRow'
			}
					
			, // Template for this Table
			template: '#mast-template-testtable'
					
			, // Model is optional
			model: null
					
			, 
			outlet: '.sandbox'
			
			, 
			collection: testtableRowCollection
					
			, 
			rowtemplate: '#mast-template-testtable-row'
					
			, 
			rowoutlet: '.row-outlet'
			
			, 
			deselectAll: function(e) {
				_.each(this.patterns,function(pattern){
					pattern.set('highlighted',false);
				});
			}
			
			, 
			toggleRow: function(rowId, e){
				debug.debug("TOGGLEROW!");
				if (this.patterns[rowId].get('highlighted')) {
					this.patterns[rowId].set('highlighted',false);
				}
				else {
					this.patterns[rowId].set('highlighted',true);
				}
			}
			
			,deleteRow: function(rowId,e) {
				debug.debug("Deleting row "+rowId);
				e.stopImmediatePropagation();
			}
			
			// Triggered after rendering each row
			,afterRenderRow: function(rowId) {
				
			}
		});
				
				
		// Now append the table to its outlet
		t.append();
				
		// We can allow the user to continue on now
		new Mast.Component({
			events: {
				click: function(e) {
					Mast.navigate('index');
				}
			},
			template: '#mast-template-button',
			model: new Mast.Model({
				label: '< Previous experiment'
			}),
			outlet: '.sandbox'
		});
	}
}