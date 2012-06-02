Mast.components.ComponentA = Mast.Component.extend({
	events: {},

	init: function () {
		this.on('dropdownSubmit',this.changeName);
	},
	
	changeName: function(formFieldValue) {
		this.set('name',formFieldValue);
	},

	// Subcomponents to register
	subcomponents: {
		menu1:{
			component: "DropdownComponent",
			outlet: ".ddown",
			beforeOpenMenu: function () {
				this.set('value',this.parent.get('name'));
			}
		},
		menu2:{
			component: "DropdownComponent",
			outlet: ".ddown",
			beforeOpenMenu: function () {
				this.set('value',this.parent.get('name'));
			}
		}
	},

	template: '.test',

	outlet:'.sandbox',

	// Triggered after each render
	afterRender: function () {
		this.$el.draggable();
	}
});