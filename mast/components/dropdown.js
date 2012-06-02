// Define a reusable dropdown component
// Parent can listen to the "submit" event"
Mast.components.DropdownComponent = Mast.Component.extend({
	template: '.dropdown',
	model: {
		value: ""
	},
	events: {
		click:'openMenu', 
		clickoutside: 'closeMenu',
		pressEnter: 'submitForm',
		pressEscape: 'closeMenu',
		'click a.submit': 'submitForm'
	},
	beforeOpenMenu: function () {
		
	},
	openMenu: function(e) {
		this.beforeOpenMenu && this.beforeOpenMenu();
		
		if (!this.get('open')) {
			debug.debug("Opened menu.",this.get('value'));
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
		this.set('value',this.$el.find('input').val());
		this.parent.trigger('dropdownSubmit',this.get('value'));
		this.closeMenu();
		e.stopImmediatePropagation();
		e.stopPropagation();
	},

	// Triggered after each render
	afterRender: function () {}
});