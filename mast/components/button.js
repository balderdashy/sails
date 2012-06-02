Mast.components.Button = Mast.Button = Mast.Component.extend({
		
	events: {},
		
	init: function() {
		this.events.click = this.click;
		this.set('label',this.label);
	},
	
	afterRender: function () {
		this.$el.disableSelection();
	},
		
	template: '#mast-template-button',
		
	model: {
		label: 'Press me!'
	}
});
