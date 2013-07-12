module.exports.views = {

	// Templating engine/language to be used for views 
	// (must be ejs, jade, or hbs)
	engine: 'ejs',

	// If enabled, views are automatically served at logical routes,
	// based on their paths. This comes in handy any time you just want to
	// serve some static HTML. (i.e. a brochure site)
	// 
	// For example, the static view files below are available at the specified routes:
	//		`views/catalog.ejs`			: `get /catalog`
	//		`views/catalog/index.ejs`	: both `get /catalog` & `get /catalog/index`
	//		`views/catalog/story.ejs`	: `get /catalog/story`
	routes: true,

	// Layout is on by default, in the top level of the view directory
	// true === use default (layout)
	// false === don't use a layout
	// string === path to layout (relative path starting in views directory)
	layout: true

};