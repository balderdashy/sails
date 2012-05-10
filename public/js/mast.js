(function (){
		
	Mast = _.extend(Backbone,Backbone.Events);
	
	
	
	
	
	
	//  Create router	
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
	
	
	
	
	
	
	
	
	
	
	// Create socket wrapper
	Mast.socket = io.connect('http://localhost:5008');
	Mast.socket.on('connect',function() {
		debug.debug("Socket connected.");
	});	
	
	
	
	
	
	
	
	
	// Add outerHtml to jQuery
	jQuery.fn.outerHTML = function(s) {
		return s
		? this.before(s).remove()
		: jQuery("<p>").append(this.eq(0).clone()).html();
	};
	
	// Set up template settings
	_.templateSettings = {
		interpolate : /\{\{(.+?)\}\}/g,
		escape : /\{\{(-.+?)\}\}/g,
		evaluate : /\{\%(.+?)\%\}/g
	};
	
	// CSS class used to mark templates (hidden)
	Mast.templateCSSClass = "template";
	
	// Prepare template library
	// HTML templates can be manually assigned here
	// otherwise they can be loaded from DOM elements
	// or from a URL
	Mast.TemplateLibrary = {}
	
	
	// Patterns are the smallest unit that has state and a template
	// They are always owned by a Component, and their only logic should be the 
	// deterministic generation of HTML given a particular model and template
	Mast.Pattern = Mast.View.extend({
		
		// Absorb and delete template
		initialize: function(attributes,options){
			
			// Bind context
			_.bindAll(this);
			var self=this;
			
			_.extend(this,attributes);
			
			this.absorbTemplate(this.template);
			
			// Listen for changes in model and bubble them up
			this.model.on('change',function(model,parameters){
				self.trigger('change',parameters);
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
			
				// Absorb template
				$template.removeClass(Mast.templateCSSClass);
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
			this.trigger('change');
		},
		
		
		_normalizeData: function (data) {
			var modelData = this.model && this.model.toJSON && this.model.toJSON();
			return data ? _.extend(_.clone(modelData), data) : modelData || {};
		}
	});
	
	// Components are the smallest unit of event handling and logic
	// Components may handle events for homogenous child pattern collections, 
	// but not for unique child components
	Mast.Component = Mast.Pattern.extend({
		
		initialize: function(attributes,options){

			// Bind context
			_.bindAll(this);
			var self = this;
			
			_.extend(this,attributes);
			
			if (!this.pattern) {
				if (!this.template) {
					throw new Error ("No pattern or template selector specified for component!");
				}
				else {
					this.pattern = new Mast.Pattern({
						template: this.template,
						model: this.model ? this.model : new Mast.Model
					}).on('change',this.render);
				}
			}
			else {
				if (this.template || this.model) {
					debug.warn ('A template selector and/or model was specified '+
						' even though a pattern was also specified!! \n'+
						'Ignoring and using the specified pattern...');
				}
			}
			
			// Autorender is off by default
			// By default, append to the outlet, don't replace it
			this.autorender!==false && 
				(this.replaceOutlet ? this.replace() : this.append());
			
			// Trigger init event
			_.result(this,'init');
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
		render: function () {
			var $element = this._generate();
			this.$el.replaceWith($element);
			this.setElement($element);
			
			_.result(this,'afterRender');
			return this;
		},
		
		// Use pattern to generate a DOM element
		_generate: function (data) {
			data = this._normalizeData(data);			
			return $(this.pattern.generate(data));
		},
		
		// Check that outlet is valid
		_verifyOutlet: function (outlet) {
			outlet = outlet || this.outlet;
			
			if (!outlet) {
				throw new Error("No outlet selector specified to render into!");
				return false;
			}
			
			var $outlet = $(outlet);
			if ($outlet.length < 1) {
				throw new Error("No elements exist for the specified outlet "+
					"selector! ('"+outlet+"')");
				return false;
			}
			
			return $outlet;
		}
	});
	
	
	
	
	
		
//	Row = Mast.Model.extend({
//		defaults: {}
//	});
//	
//	Rows = Mast.Collection.extend({
//		model: Row
//	});
//	
//	// Define the pattern
//	RowPattern = Mast.Pattern.extend({
//		template: '.row.template'
//	});
//		
	
//	TableComponent = Mast.Pattern.extend({
//		events: {
//			"click .cell": 'test'
//		},
//		test: function() {
//			console.log("gdsa");
//		},
//		
//		
//		template: '.row.template',
//		
//		model: new Row,
//		
//		collection: new Cells,
//		collectionPatterns: [],
//				
//		render: function (data) {
//				
//			// If data was specified, combine it with the existing model
//			data = data ? _.extend(_.extend({},this.model.toJSON()),data) : this.model.toJSON();
//
//			// Prepare cells buffer
//			data.cells = "";
//			this.collectionPatterns = [];
//			this.collection.each(function(cell) {
//				var pattern = new CellPattern({
//					model: cell
//				}),
//				html = pattern.generate();
//				this.collectionPatterns.push(pattern);
//				
//				data.cells += html;
//			},this);
//			Mast.Pattern.prototype.render.call(this,data);
//			return this;
//		}
//	});
		
		
		
		
		
//	$(function() {
//		
//		
//		// "Place" the pattern
//		row = new TableComponent({
//			collection:new Cells([
//			new Cell({
//				name:"AxDG"
//			}),
//			
//			new Cell({
//				name:"22"
//			})
//			]),
//			el: '.row.component'
//		});
//		row.render();
//	})
//	
	
})();