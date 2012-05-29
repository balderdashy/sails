// Define a reusable dropdown component
// Parent can listen to the "submit" event"
Mast.components.DropdownComponent = Mast.Component.extend({
	template: '.dropdown',
	events: {
		click:'openMenu', 
		clickoutside: 'closeMenu',
		'click a.submit': 'modifyItem'
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
	
	modifyItem: function (e) {
		this.parent.trigger('submit',this.$el.find('input'));
		this.closeMenu();
		e.stopImmediatePropagation();
		e.stopPropagation();
	},

	// Triggered after each render
	afterRender: function () {}
});