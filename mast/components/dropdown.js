// Define a reusable dropdown component
var DropdownComponent = Mast.Component.extend({
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