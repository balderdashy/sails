
ComponentA = Mast.Component.extend({
	events: {},

	// Subcomponents to register
	subcomponents: [
	{
		component: DropdownComponent,
		outlet: ".ddown"
	},
	{
		component: DropdownComponent,
		outlet: ".ddown"
	}
	],

	model: new Mast.Model({
		name:'THING1 rendered!  Appended a dropdown component as well.'
	}),

	template: '.test',

	outlet:'.sandbox',

	// Triggered after each render
	afterRender: function () {
		this.$el.draggable();
	}
});

ComponentB = Mast.Component.extend({

	// Subcomponents to register
	subcomponents: [
	{
		component: DropdownComponent,
		outlet: ".ddown"
	}
	],

	pattern: new Mast.Pattern({
		model: new Mast.Model({
			name:'te1'
		}),
		template: '.test'
	}),

	outlet:'.sandbox',

	// Triggered after each render
	afterRender: function () {
		this.$el.draggable();
	}
});