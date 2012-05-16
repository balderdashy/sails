var TestRow = Mast.Model.extend({
	defaults: {
		highlighted: false
	}
})

var TestRows = Mast.Collection.extend({
	url: '/experiment',
	model: TestRow
});