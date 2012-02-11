var _ = require('underscore');

exports.index = function (req, res, next ) {

//	// Fetch paginated list of all nodes
//	db.Content.gatherByContext(null,function (content) {
//		content = _.collect(content,function(val,key) {
//			return {
//				title:		val.title,
//				type:		val.type,
//				payload:	val.payload
//			}
//		});
		
		res.render('node/index', {
			title: 'Manage Content | crud.io'
		});
//	})
	
}

exports.view = function (req, res, next ){
	res.render('node/view', {
		title: 'Edit Content Node | crud.io'
	});
}