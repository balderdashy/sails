Mast.components.Button = Mast.Button = Mast.Component.extend({
		
	events: {},
		
	init: function() {
		this.events.click = this.click;
		this.set('label',this.label);
	},
		
	template: '#mast-template-button',
		
	model: new Mast.Model({
		label: 'Press me!'
	})
});
