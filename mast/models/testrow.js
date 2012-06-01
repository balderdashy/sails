Mast.models.TestRow = Mast.Model.extend({
	urlRoot: '/experiment',
	defaults: {
		highlighted: false,
		allowEdit: false,
		title: 'Sample',
		value: Math.floor(Math.random()*5000)
	}
})

Mast.models.TestRows = Mast.Collection.extend({
	url: '/experiment',
	model: Mast.models.TestRow
});