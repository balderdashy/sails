(function (){
		
	// Build mast objects and set defaults
	Mast = _.extend(Backbone,
	{
		
		// CSS class for Mast rows in a Table
		rowCSSClass: 'mast-row',
		
		// Mast.Socket wraps around socket.io to provide a universal API 
		// for programatic communication with the Sails backend
		Socket: _.extend(
		{	
			io:io,
			baseurl: window.location.origin,
			autoconnect: true,
			initialize: function() {
				_.bindAll(this);
				if (this.autoconnect) {
					this.connect();
				}
			},
				
			// TODO: Investigate removing this and doing it all automatically
			events: {
				connect: "status"
			},

			// Report status of socket
			status: function() {
				debug.debug("Socket " + (this.connected ? "connected to "+this.baseurl+".":"not connected!!!"));
			},

			// Connect to socket
			connect: function(baseurl) {
				if (this.connected) {
					throw new Error(
						"Can't connect to "+baseurl+ " because you're "+
						"already connected to a socket @ " + this.baseurl+"!"
						);
				}
					
				this.baseurl = baseurl || this.baseurl;
				this._socket = io.connect(this.baseurl);
					
				// Map events
				_.each(this.events,function(eventFn,eventName) {
					Mast.Socket._socket.on(eventName,this[eventFn]);
				},this);
					
				this.connected = true;
			}
		},Backbone.Events),
			
			
			
			
		// Patterns are the smallest unit that has state and a template
		// They are always owned by a Component, and their only logic should be the 
		// deterministic generation of HTML given a particular model and template
		Pattern: {
		
			// Absorb and delete template
			initialize: function(attributes,options){
				// Bind context
				_.bindAll(this);
				var self=this;
			
				_.extend(this,attributes);
			
				this.absorbTemplate(this.template);
			
				// Listen for changes in model and bubble them up
				this.model.on('change',function(model,parameters){
					self.trigger('change');
				});
			
				// Initialize init method if specified
				_.result(this,'init');
			},
		
			// Absorb or access cached template
			absorbTemplate: function(selector) {
				var $template = $(selector);
				if (typeof Mast.TemplateLibrary[selector] != 'undefined') {
					// Grab cached copy of html from template library
					this._template = Mast.TemplateLibrary[selector];
				}
				else {
					// Check that template element exists
					if ($template.length < 1) {
						throw new Error("No elements exist for the specified template "+
							"selector! ('"+selector+"')");
						return;
					}
			
					// Absorb template (removes id attr!)
					$template.removeAttr("id");
					this._template = $template.outerHTML();
					$template.remove();
				
					// Remember html in template library
					Mast.TemplateLibrary[selector] = this._template;
				}
			},
		
			// Return templated HTML for this pattern
			generate: function (data) {
				data = this._normalizeData(data);
				
				return ((_.template(this._template))(data));
			},
		
		
			// Replace this pattern's template and create one with the specified 
			// template selector.
			setTemplate: function (template) {
				this.absorbTemplate(template);
				
				// The change event must be manually triggered since there's no
				// model watching the templates
				this.trigger('change');
			},
			
			// Pass-through methods to model
			set: function(key,value) {
				return this.model.set(key,value);
			},
			get: function(key) {
				return this.model.get(key);
			},
			
			_normalizeData: function (data) {
				var modelData = this.model && this.model.toJSON && this.model.toJSON();
				return data ? _.extend(_.clone(modelData), data) : modelData || {};
			}
		},
	
	
	
	
		// Components are the smallest unit of event handling and logic
		// Components may contain sub-components, but (as of may 12th 2012),
		// they are responsible for calling render on those elements
		Component: {
		
			initialize: function(attributes,options,dontRender){

				// Bind context
				_.bindAll(this);
			
				_.extend(this,attributes);
			
				if (!this.pattern) {
					if (!this.template) {
						throw new Error ("No pattern or template selector specified for component!");
					}
					else {
						this.pattern = new Mast.Pattern({
							template: this.template,
							model: this.model ? this.model : new Mast.Model
						});
					}
				}
				else {
					if (this.template || this.model) {
						debug.warn ('A template selector and/or model was specified '+
							' even though a pattern was also specified!! \n'+
							'Ignoring extra attributes and using the specified pattern...');
					}
				}
				
				// If this belongsTo another component, disable autorender
				if (this.belongsTo) {
					this.autorender = false;
				}
				
				// Maintain list of subcomponents
				this._subcomponents = [];
			
				// Watch for changes to pattern
				this.pattern.on('change',this.render);
				
				// Register any subcomponents
				_.each(this.subcomponents,function(properties) {
					this.registerSubcomponent(properties);
				},this);
				
				// Trigger init event
				_.result(this,'init');
				
				// Watch for and announce statechange events
				this.on('afterRender',this.afterRender);
				
				// Autorender is on by default
				// Default render type is "append", but you can also specify "replaceOutlet""
				if (!dontRender && this.autorender!==false) {
					if (this.replaceOutlet) {
						this.replace()
					}
					else {
						this.append();
					}
				}
			},
		
			// Append the pattern to the outlet
			append: function (outlet) {
				var $outlet = this._verifyOutlet(outlet,
					this.belongsTo && this.belongsTo.$el);
			
				this.render();
				$outlet.append(this.$el);
			
				return this;
			},
		
			// Replace the outlet with the rendered pattern
			replace: function (outlet) {
				var $outlet = this._verifyOutlet(outlet);
				
				this.setElement($outlet);
				this.render();
				return this;
			},
		
			// Render the pattern in-place
			render: function (silent) {
				var $element = this.generate();
				this.$el.replaceWith($element);
				this.setElement($element);
			
				// If any subcomponents exist, 
				_.each(this._subcomponents,function(subcomponent) {
					// append them to the appropriate outlet
					_.defer(function() {
						subcomponent.append();
					})
				},this);
			
				if (!silent) {
					this.trigger('afterRender');
				}
				return this;
			},
			
			// Use pattern to generate a DOM element
			generate: function (data) {
				data = this._normalizeData(data);
				return $(this.pattern.generate(data));
			},
			
			registerSubcomponent: function(options) {
				var Subcomponent;
				
				if (!options.component) {
					throw new Error("Cannot register subcomponent without specifying which component to register!");
				}
				else {
					Subcomponent = options.component;
				}
				
				// Instantiate subcomponent, but don't append/render it yet
				var subcomponent = new Subcomponent({
					belongsTo: this,
					outlet: options.outlet
				});
				this._subcomponents.push(subcomponent);
			},
			
			// Free the memory for this component and remove it from the DOM
			destroy: function () {
				this.undelegateEvents();
				this.$el.remove();
			},
			
			// Determine the proper outlet selector and ensure that it is valid
			_verifyOutlet: function (outlet,context) {
				//				console.log("!!!!",context);
				outlet = outlet || this.outlet;
			
				if (!outlet) {
					throw new Error("No outlet selector specified to render into!");
					return false;
				}
				
				var $outlet = (context && context.find(outlet)) || $(outlet);
				if ($outlet.length != 1) {
					throw new Error(
						(($outlet.length > 1)?"More than one ":"No ")+
						(($outlet.length > 1)?"element exists ":"elements exist ")+
						(context?"in this template context ("+context+ ")":"") +
						"for the specified "+
						(context?"child ":"") +
						"outlet selector! ('"+outlet+"')");
					return false;
				}

			
				return $outlet;
			},
			
			// Used for debugging
			_test: function() {
				debug.debug("TEST FUNCTION FIRED!",arguments,this);
			}
		},
	
	
	
	
		// A Table is a special Component that may handle events for a
		// homogenous collection of child components.
		// 
		// It also provides an API for performing CRUD operations on that
		// collection, both on the clientside and over the Socket using
		// Backbone REST-style semantics.
		Table: {
			
			initialize: function (attributes,options,dontRender){
				
				// Initialize main component
				Mast.Component.prototype.initialize.call(this,attributes,options,true);
				
				_.bindAll(this);
				
				// Watch for and announce statechange events
				this.on('afterRenderRow',this.afterRenderRow);
				
				// Watch for collection changes
				var self = this;
				this.collection.on('remove',function(model,collection,status) {
					self.render();
				});
				this.collection.on('change',function(model,status) {
					self.renderRow(model);
				});
				this.collection.on('add',function() {
					self.render();
				});
				
				// Verify rowtemplate
				if (!this.rowtemplate) {
					throw new Error("No rowtemplate specified!");
				}
				
				// Autorender is on by default
				// Default render type is "append", but you can also specify "replaceOutlet""
				if (!dontRender && this.autorender!==false) {
					if (this.replaceOutlet) {
						this.replace()
					}
					else {
						this.append();
					}
				}
				
			},
			
			// Render the Table, its subcomponents, and all rows
			render: function () {
				// Render main pattern
				Mast.Component.prototype.render.call(this,true);
				
				// Determine and verify row outlet
				if (!this.rowoutlet) {
					// If no rowoutlet is explicitly specified,
					// just append the row elements to this.$el
					this.$rowoutlet = this.$el;
				}
				else {
					// Otherwise use the rowoutlet selector to find
					// the row outlet element inside of this.$el
					this.$rowoutlet = this._verifyOutlet(this.rowoutlet,this.$el);
				}
				
				// Empty and append rows to the outlet
				this.$rowoutlet.empty();
				this._appendRows();
				
				// Listen for row DOM events and redelegate events
				this._listenToRows();
				this.delegateEvents();
			},
			
			// Render the given row in place
			renderRow: function (model,status) {
//				var id = this._getRowIndexFromEl(el);
//				debug.debug("RENDERING ROW!!!!!",arguments);
				this._replaceRow(this.collection.indexOf(model),this._generateRowElement(model));
			},
			
			
			
			deleteRow: function (id) {
				this.collection.remove(this.collection.at(id));
			},
			
			// Lookup the element for the id'th row
			getRowEl: function (id) {
				return this.getRowsEl().eq(id);
			},
			
			// Lookup $ set of all rows
			getRowsEl: function () {
				return this.$rowoutlet.children();
			},

			// Update and render patterns from collection
			_appendRows: function() {
				// Update and render patterns from collection
				var self = this;
				this.collection.each(function(model,index){
					
					// Append the row
					var el = self._generateRowElement(model);
					self._appendRow(el);
				});
			},
			
			// Delegate row events
			_listenToRows: function () {
				_.each(this.rowevents,function(fn,ev) {
					var delegateEventSplitter = /^(\S+)\s*(.*)$/;
					var match = ev.match(delegateEventSplitter);
					var eventName = match[1], selector = match[2];
					
					
					// Inject row CSS class selector
					ev = eventName + 
					" ." + Mast.rowCSSClass+
					((selector) ? (" " + selector) : "");
					
					if (!_.isFunction(fn)) {
						fn = this[fn];
					}
					
					var handler = function(e) {
						var index = this._getRowIndexFromEvent(e);
						return fn(index,e);
					};
					handler = _.bind(handler,this);
					this.events[ev] = handler;
				},this);
			},
			
			// Append newly generated row element to rowoutlet
			_appendRow: function($el){
				this.$rowoutlet.append($el);
				this.trigger('afterRenderRow',$el.index());
			},
			
			// Replace the given row with the new element
			_replaceRow: function(id,$el){
				var oldEl = this.getRowEl(id);
				oldEl.replaceWith($el);
			},
			
			// Generate element and add CSS identifier class
			_generateRowElement: function (model) {
				var pattern = new Mast.Pattern({
					template: this.rowtemplate,
					model: model
				});
				var $element = $(pattern.generate());
				return $element.addClass(Mast.rowCSSClass);
			},
			
			// Given the event object, return the index of this row's element
			_getRowIndexFromEvent: function (e) {
//				console.log("?",e,$(e.currentTarget).is('.'+Mast.rowCSSClass),$(e.currentTarget).parents('.'+Mast.rowCSSClass),$(e.currentTarget),$(e.currentTarget).index());
				var $target = $(e.currentTarget),
					rowSelector = '.'+Mast.rowCSSClass;
					
				if ($target.is(rowSelector)) {
					return $target.index();
				}
				else {
					var $targetRow = $target.parentsUntil($(e.delegateTarget),rowSelector);
					if (!$targetRow) {
						throw new Error("Invalid row structure!  Couldn't select a row in this delegate.");
					}
					return $targetRow.index();
				}
				
			},
			
			_getRowIndexFromEl: function (el) {
				var $target = $(el);
				return $target.index();
			}
		},
		
		
		
		// Mast.raise() instantiates the Mast library with the specified options
		raise: function (options,afterLoadFn) {
			
			
			// Convert options.routes into a format Backbone's router will accept
			// (can't have key:function(){} style routes, must use a string function name)
			var routerConfig = {
				routes:{}
		};
		var indexRoute = null;
		if (options.controller) {
			_.each(options.controller,function(action,query) {
				if (query=="routes") return;
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
		}
			
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
		this.Socket.baseurl = options.baseurl || this.Socket.baseurl;
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
			escape : /\{\{(-.+?)\}\}/g,
			evaluate : /\{\%(.+?)\%\}/g
		};
				
				
		// Extend Backbone structures
		Mast.Pattern = Mast.View.extend(Mast.Pattern);
		Mast.Component = Mast.Pattern.extend(Mast.Component);
		Mast.Table = Mast.Component.extend(Mast.Table);
			
		// When Mast and $.document are ready, 
		// trigger afterLoad callback (if specified)
		$(function(){
			afterLoadFn && _.defer(afterLoadFn);
		})
			
	}
	},
	Backbone.Events);

})();