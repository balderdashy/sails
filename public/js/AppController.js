//
// Define Mast components, collections, models, etc.
/////////////////////////////////////////////////////
//
	// Create a random new row
	function generateSampleRow (){
		return new Mast.Model({
		
			title: 'Sample',
			value: Math.floor(Math.random()*5000),
			highlighted: false
		});
	}

	var TestRow = Mast.Model.extend({
		defaults: {
			highlighted: false
		}
	})

	var TestRows = Mast.Collection.extend({
		url: '/experiment',
		model: TestRow
	});
	
	Mast.Button = Mast.Component.extend({
		events:{},
		init: function() {
			this.events.click = this.click;
			this.set('label',this.label);
		},
		template: '#mast-template-button',
		model: new Mast.Model({
			label: 'Press me!'
		})
	});
//////////////////////////////////////////////////////
	

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
				click:'openMenu', 
				clickoutside: 'closeMenu'
			},
			init: function() {
			
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
		a.set('name','Changed THING1\'s model.');
		b.set('name','Changed THING2\'s model.');


		// Now let's change the template-- notice how the DOM automatically updates
		// This is great for instances when a whole bunch of HTML needs to change 
		a.setTemplate('.test1');
		b.setTemplate('.test1');

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
		new Mast.Button({
			label: 'Next experiment >',
			click: function(e) {
				Mast.navigate('tableExample');
			},
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
			
			emptytemplate: '#mast-template-testtable-empty',
			
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
					
			events: {
				'click .deselectAll': 'deselectAll',
				'click .addRow': 'addRow'
			}
					
			// Row events are triggered when any of the
			// child rows fire a DOM event
			, 
			rowevents: {
				'click .doDelete': 'removeRow',
				'click': 'toggleRow'
			}
					
			, // Template for this Table
			template: '#mast-template-testtable'
					
			, // Model is optional
			model: null
					
			, 
			outlet: '.sandbox'
			
			, 
			collection: new TestRows()
					
			, 
			rowtemplate: '#mast-template-testtable-row'
					
			, 
			rowoutlet: '.row-outlet'
			
			, 
			deselectAll: function(e) {
				this.collection.each(function(model){
					model.set('highlighted',false);
				});
			}
			
			,
			addRow: function(e) {
				var model = generateSampleRow(this.collection.length);
				this.collection.create(model);
			}
			
			, 
			toggleRow: function(rowId, e){
				var rowModel = this.collection.at(rowId);
				if (rowModel.get('highlighted')) {
					debug.debug("Dimming row w/ id: "+rowModel.id+" @ index: "+rowId);
					rowModel.set('highlighted',false);
				}
				else {
					debug.debug("Highlighting row w/ id: "+rowModel.id+" @ index: "+rowId);
					rowModel.set('highlighted',true);
				}
			}
			
			,
			removeRow: function(rowId,e) {
				var rowModel = this.collection.at(rowId);
				debug.debug("Deleting row w/ id: "+rowModel.id+" @ index: "+rowId);
				this.collection.remove(rowModel);
				e.stopImmediatePropagation();
			}
			
			,
			// Triggered after rendering the entire table
			afterRender: function() {
			}
			
			// Triggered after rendering each row
			,
			afterRenderRow: function(rowId) {
				this.$rowoutlet.children().eq(rowId).disableSelection();
				
			}
		});
				
				
		// Now append the table to its outlet.
		// We could have just created the table normally,
		// but I wanted to demonstrate how to disable autorender.
		t.append();

		// Finally, let's create another button for the user to go back
		// to the previous example		
		new Mast.Button({
			label: '< Previous experiment',
			click: function(e) {
				Mast.navigate('index');
			},
			outlet: '.sandbox'
		});
	}
}