Mast.components.ComponentB = Mast.Component.extend({

	// Subcomponents to register
	subcomponents: [
		{
			component: "DropdownComponent",
			outlet: ".ddown"
		}
	],
	
	template: '.test',
	model: new Mast.Model({name:'tel'}),
	outlet:'.sandbox',

	// Triggered after each render
	afterRender: function () {
		this.$el.draggable();
	}
});