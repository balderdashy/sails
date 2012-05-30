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
		if (!this.get('open')) {
			this.set('open',true);
			this.pattern.setTemplate('.dropdown-expanded');
		}
		e.stopImmediatePropagation();
	},

	closeMenu: function () {
		if (this.get('open')) {
			debug.debug("Closed menu.");
			this.set('open',false);
			this.pattern.setTemplate('.dropdown');
		}
	},
	
	modifyItem: function (e) {
		this.parent.trigger('dropdownSubmit',this.$el.find('input').val());
		this.closeMenu();
		e.stopImmediatePropagation();
		e.stopPropagation();
	},

	// Triggered after each render
	afterRender: function () {}
});