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
			
				// Watch for changes to pattern
				this.pattern.on('change',this.render);
				
				// Watch for and announce statechange events
				this.on('afterRender',this.afterRender);
			
				// Trigger init event
				_.result(this,'init');
				
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
			
//				if (this.autorender===false) {
//					this.$el = this._verifyOutlet();
//				}
			
			},
		
			// Append the pattern to the outlet
			append: function (outlet) {
				var $outlet = this._verifyOutlet(outlet);
			
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
				
//				// Handle special clickoutside event
//				console.log("Rendering component: ",this.$el.attr('class'), "cid=",this.cid,"el",this.$el);
//				if (this.events && this.events.clickoutside) {
//					var self = this;
//					var eventfn = this[this.events.clickoutside];
//					var uid = this.cid;//this._verifyOutlet();
//					
//					_.defer(self.$el.clickoutside,uid,eventfn,this.$el);
//				}
			
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
			
			
			//////////////////////////////////////////////////////////////////////
			// TODO: MAKE THIS WORK!!!!
			// problem is the *native function * stuff
			// Create a short, deterministic hash key from a function variable
			_deterministicFnHashId: function (fn) {
				var asString = fn.toString(),
				uniquenessQuotient = 25,
				firstBit = asString.substr(0,uniquenessQuotient),
				range = (asString.length-(uniquenessQuotient+1)),
				lastBitStartPoint = (range>0)?range:0,
				lastBit = asString.substring(
					lastBitStartPoint,asString.length-1
					);
						
				var hashid = "";
				for (var i=0;i<lastBit.length-lastBitStartPoint;i++){
					console.log(firstBit.charCodeAt(i));
					var encodedCharCode = lastBit.charCodeAt(i+lastBitStartPoint)+
					firstBit.charCodeAt(i);
					hashid += encodedCharCode+".";
				}
				console.log("~~~~~~~~~~",asString,"********",hashid,range);
				return hashid;
			},
			///////////////////////////////////////////////////////////////////////////
		
		
			// Check that outlet is valid
			_verifyOutlet: function (outlet,onlyDescendants) {
				outlet = outlet || this.outlet;
			
				if (!outlet) {
					throw new Error("No outlet selector specified to render into!");
					return false;
				}
				
				var $outlet = (onlyDescendants && this.$el.find(outlet)) || $(outlet);
				if ($outlet.length != 1) {
					throw new Error(
						(($outlet.length > 1)?"More than one ":"No ")+
						(($outlet.length > 1)?"element exists ":"elements exist ")+
						(onlyDescendants?"in this template ":"") +
						"for the specified "+
						(onlyDescendants?"row ":"") +
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
				
				// Verify rowtemplate
				if (!this.rowtemplate) {
					throw new Error("No rowtemplate specified!");
				}
				
				// Parent's render is disabled, so we have to take of that here
				// Autorender is on by default
				// Default render type is "append", but you can also specify "replaceOutlet""
				!dontRender && this.autorender!==false && 
				(this.replaceOutlet ? this.replace() : this.append());
				
			},
			
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
					this.$rowoutlet = this._verifyOutlet(this.rowoutlet,true);
				}
				
				// Empty the row outlet
				this.$rowoutlet.empty();
				
				// Update and render patterns from collection
				var self = this;
				this.patterns = this.collection.map(function(model,index){
					var pattern = new Mast.Pattern({
						model: model,
						template: self.rowtemplate
					});
					
					// Watch each pattern for changes
					pattern.on('change',_.bind(self.renderRow,self,index));
					
					// Append the row
					self._appendRow(self._generateRowElement(pattern));
					
					// And keep track of the pattern for more efficient 
					// rendering later on
					return pattern;
				});
				
				// Listen for row events and redelegate events
				_.each(this.rowevents,function(fn,ev) {
					ev += " ."+Mast.rowCSSClass;
					var handler = function(e) {
						var index = this._getRowIndex(e);
						return this[fn](index,e);
					};
					handler = _.bind(handler,this);
					
					this.events[ev] = handler;
				},this);
				this.delegateEvents();
			},
			
			// Render the given row in place
			renderRow: function (id) {
				this._replaceRow(
					id,
					this._generateRowElement(this.patterns[id])
					);
			},
			
			// Append newly generated row element to rowoutlet
			_appendRow: function($el){
				this.$rowoutlet.append($el);
			},
			
			// Replace the given row with the new element
			_replaceRow: function(id,$el){
				var oldEl = this._getRowEl(id);
				oldEl.replaceWith($el);
			},
			
			_getRowEl: function (id) {
				return this.$rowoutlet.children().eq(id);
			},
			
			_generateRowElement: function (pattern) {
				// Generate element and add row class
				var $element = $(pattern.generate());
				return $element.addClass(Mast.rowCSSClass);
			},
			
			// Given the event object, return the index of this row
			_getRowIndex: function (e) {
				return $(e.currentTarget).index();
			}
		},
		
		
		
		// Mast.raise() instantiates the Mast library with the specified options
		raise: function (options,readyfn) {
			
			
			//  Create history router	
			var Itinerary = Mast.Router.extend({
				routes: {
					"home":	"home"
				},

				home: function (query,page) {
				}
			});
			var app = new Itinerary();
			$(function(){
				Mast.history.start();
			});

	
			// Initialize Socket
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
			
			// When Mast and $.document are ready, execute ready callback
			$(function(){
				_.defer(readyfn);
			})
			
		}
	},
	Backbone.Events);

})();