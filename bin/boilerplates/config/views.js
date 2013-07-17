/**
 * Views
 * 
 * Server-sent views are a classic and effective way to get your app up and running.
 * Views are normally served from controllers, but by default, Sails also exposes routes
 * to allow you to preview your views in a browser.  This automatic routing can be disabled
 * using the `blueprint` config below.  You can also configure your templating language/framework
 * of choice, and configure Sails' layout support.
 *
 * For more information on views and layouts, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.views = {

  // View engine (aka template language)
  // to use for your app's *server-side* views
  // 
  // Sails+Express supports all view engines which implement
  // TJ Holowaychuk's `consolidate.js`, including, but not limited to:
  // 
  // ejs, jade, handlebars, mustache
  // underscore, hogan, haml, haml-coffee, dust
  // atpl, eco, ect, jazz, jqtpl, JUST, liquor, QEJS, 
  // swig, templayed, toffee, walrus, & whiskers

  engine: 'ejs',



  // Layouts are simply top-level HTML templates you can use as wrappers 
  // for your server-side views.  If you're using ejs, you can take advantage of
  // Sails' built-in `layout` support.
  // 
  // With using a layout, when one of your views is served, it is injected into
  // the <%- body %> partial defined in the layout.  This lets you reuse header
  // and footer logic between views.
  //
  // NOTE:  Layout support is only implemented for the `ejs` view engine!
  //        For most other engines, it is not necessary, since they implement 
  //        partials/layouts themselves.  In those cases, this config willwill be silently 
  //        ignored.
  //
  // The `layout` setting may be set to one of:
  // 
  // If `true`, Sails will look for the default, located at `views/layout.ejs`
  // If `false`, layouts will be disabled.
  // Otherwise, if a string is specified, it will be interpreted as the relative path 
  // to your layout from `views/` folder.
  // (the file extension, e.g. ".ejs", should be omitted)
  //

  layout: 'layout'



  // Using Multiple Layouts with EJS
  //
  // If you're using the default engine, `ejs`, Sails supports the use of multiple
  // `layout` files.  To take advantage of this, before rendering a view, override
  // the `layout` local in your controller by setting `res.locals.layout`.
  // (this is handy if you parts of your app's UI look completely different from each other)
  //
  // e.g. your default might be
  // layout: 'layouts/public'
  // 
  // But you might override that in some of your controllers with:
  // layout: 'layouts/internal'


};