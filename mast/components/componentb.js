Mast.components.ComponentB = Mast.Component.extend({

	// Subcomponents to register
	subcomponents: [
		{
			component: "DropdownComponent",
			outlet: ".ddown"
		}
	],
	
	init: function () {
		this.on('dropdownSubmit',this.changeName);
	},
	
	changeName: function(formFieldValue) {
		this.set('name',formFieldValue);
	},
	
	template: '.test',
	
	// Model need not be specified since this is a standard case
//	model: new Mast.Model({name:'tel'}),

	outlet:'.sandbox',

	// Triggered after each render
	afterRender: function () {
		this.$el.draggable();
	}
});