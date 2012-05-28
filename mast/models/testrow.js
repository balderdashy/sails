Mast.models.TestRow = Mast.Model.extend({
	defaults: {
		highlighted: false
	}
})

Mast.models.TestRows = Mast.Collection.extend({
	url: '/experiment',
	model: Mast.models.TestRow
});