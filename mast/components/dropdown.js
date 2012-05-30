// Define a reusable dropdown component
// Parent can listen to the "submit" event"
Mast.components.DropdownComponent = Mast.Component.extend({
	template: '.dropdown',
	events: {
		click:'openMenu', 
		clickoutside: 'closeMenu',
		pressEnter: 'submitForm',
		pressEscape: 'closeMenu',
		'click a.submit': 'submitForm'
	},
	init: function() {
			
	},
	openMenu: function(e){
		if (!this.get('open')) {
			debug.debug("Opened menu.");
			this.set('open',true);
			this.setTemplate('.dropdown-expanded');
			this.$el.find('input').focus();
			
		}
		e.stopImmediatePropagation();
	},

	closeMenu: function () {
		if (this.get('open')) {
			debug.debug("Closed menu.");
			this.set('open',false);
			this.setTemplate('.dropdown');
		}
	},
	
	submitForm: function (e) {
		this.parent.trigger('dropdownSubmit',this.$el.find('input').val());
		this.closeMenu();
		e.stopImmediatePropagation();
		e.stopPropagation();
	},

	// Triggered after each render
	afterRender: function () {}
});