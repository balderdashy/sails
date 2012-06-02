Mast.components.ComponentB = Mast.Component.extend({

	// Subcomponents to register
	subcomponents: [
		{
			component: "DropdownComponent",
			outlet: ".ddown",
			beforeOpenMenu: function () {
				this.set('value',this.parent.get('name'));
			}
		}
	],
	
	init: function () {
		this.on('dropdownSubmit',this.changeName);
	},
	
	changeName: function(formFieldValue) {
		this.set('name',formFieldValue);
	},
	
	template: '.test',

	outlet:'.sandbox',

	// Triggered after each render
	afterRender: function () {
		this.$el.draggable();
	}
});