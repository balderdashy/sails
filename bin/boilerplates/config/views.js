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


	// Layouts are simply top-level HTML templates you can use as wrappers 
	// for your server-side views.  If you're using ejs, you can take advantage of
	// Sails' built-in `layout` support.
	// 
	// With using a layout, when one of your views is served, it is injected into
	// the <%- body %> partial defined in the layout.  This lets you reuse header
	// and footer logic between views.
	// 
	// The `layout` setting may be set to one of:
	// 
	// true			:: use default (located at `views/layout.ejs`)
	// 'string'		:: the relative path to your layout from `views/`
	// false		:: don't use a layout
	layout:	'layout'

	
	//	*-> Multiple Layouts
	//
	// If you'd like to use a couple of different layout files, you can do so:
	// Before rendering a view, the layout config can be overridden locally
	// by setting `res.locals.layout`

	//	*-> Using Layouts With Other View Engines
	// 
	//	Keep in mind `layouts` are a feature Sails has chosen to support for
	//	convenience and backwards compatibility with Express 2.x.
	//	Layouts have only been tested with the EJS view engine (default).
	//
	//	In Express 3, support for layouts has technically been moved out to 
	//	the view engine level, so if you'd like to use something besides ejs to
	//	render server-side views (e.g. Jade, handlebars, haml, dust)
	//	for now you'll need to rely on that engine's layout support.

	//	*-> Disabling Layouts
	// 
	// Alternatively, if you can't use layouts (or don't want to) you can always
	// set `layout: false` here and use view partials to allow for code reuse.
	// E.g. you might define `views/partials/_header.ejs` and `views/partials/_footer.ejs`,
	// then include them in the proper spot in each of your views.
	// 
	// For example, here's what `views/user/dashboard.ejs` might look like:
	/*
		<%- partial(../partials/header) %>
		<h1>Dashboard</h1>
		<section id="chart">
		<!-- ....and so on -->
		</section>
		<%- partial(../partials/footer) %>
	*/

};