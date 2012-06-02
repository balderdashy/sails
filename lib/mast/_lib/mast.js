// Build mast objects and set defaults
Mast = _.extend(Backbone,
{
		
	// CSS class for Mast rows in a Table
	rowCSSClass: 'mast-row',
		
	// Route map that will be populated by user definitions
	routes: {},
		
	// Model/collection dictionary that will be populated by user definitions
	models: {},
		
	// Component dictionary that will be populated by user definitions
	components: {},	
		
	// Mast.raise() instantiates the Mast library with the specified options
	raise: function (options,afterLoadFn) {
			
			
		// Convert options.routes into a format Backbone's router will accept
		// (can't have key:function(){} style routes, must use a string function name)
		var routerConfig = {
			routes:{}
		};
		var indexRoute = null;
			
		// If external router is specified in options, use it
		if (options && options.router) {
			Mast.routes = options.router;
		}
			
		// Decorate and interpret routes
		_.each(Mast.routes,function(action,query) {
			// "routes" is a reserved word
			if (query=="routes") throw new Error("Can't define a route using reserved word: '"+query+"'!");
				
			// Save index route for the end
			if (query=="index") {
				indexRoute = action;
			}
			routerConfig.routes[query] = query;
			routerConfig[query] = action;
		});

		// Define default (index) route
		routerConfig.routes[""] = "index";
		routerConfig.index = indexRoute;

			
		// Extend and instantiate main router
		var AppRouter = Mast.Router.extend(routerConfig);
		Mast.app = new AppRouter();
			
		// Mast makes the assumption that you want to trigger
		// the route handler.  This can be overridden
		Mast.navigate = function(query,options) {
			return Mast.app.navigate(query,_.extend({
				trigger:true
			},options));
		}
			
		// when document is ready
		$(function(){
			// Launch history manager 
			Mast.history.start();
		});

	
		// Initialize Socket
		// Override default base URL if one was specified
		this.Socket.baseurl = (options && options.baseurl) || this.Socket.baseurl;
		this.Socket.initialize();
	
	
		// Add outerHtml to jQuery
		jQuery.fn.outerHTML = function(s) {
			return s
			? this.before(s).remove()
			: jQuery("<p>").append(this.eq(0).clone()).html();
		};
					
			
		// Prepare template library
		// HTML templates can be manually assigned here
		// otherwise they can be loaded from DOM elements
		// or from a URL
		Mast.TemplateLibrary = {}
			
		// TODO: Go ahead and absorb all of the templates in the library 
		// right from the get-go
			
		// Set up template settings
		_.templateSettings = {
			//				variable: 'data',
			interpolate : /\{\{(.+?)\}\}/g,
			escape : /\{\{-(.+?)\}\}/g,
			evaluate : /\{\%(.+?)\%\}/g
		};
				
			
		// When Mast and $.document are ready, 
		// trigger afterLoad callback (if specified)
		$(function(){
			afterLoadFn && _.defer(afterLoadFn);
		})
			
	}
},
Backbone.Events);
