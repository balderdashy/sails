// Patterns are the smallest unit that has state and a template
// They are always owned by a Component, and their only logic should be the 
// deterministic generation of HTML given a particular model and template
Mast.Pattern = {
		
	// Absorb and delete template
	initialize: function(attributes,options){
		// Bind context
		_.bindAll(this);
		var self=this;
			
		_.extend(this,attributes);
			
		this.absorbTemplate(this.template);
			
		// Determine whether specified model is a className, class, or instance
		this.model = this._provisionInstance(this.model,Mast.models,Mast.Model);
		
		// Listen for changes in model and bubble them up
		this.model && this.model.on('change',function(model,parameters){
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
	set: function(key,value,options) {
		if (!this.model) {
			var m = new Mast.Model();
			m.set(key,value,options);
			return m;
		}
		else 
			return this.model.set(key,value);
	},
	get: function(key) {
		return this.model && this.model.get(key);
	},
			
	_normalizeData: function (data) {
		var modelData = this.model && this.model.toJSON && this.model.toJSON();
		return data ? _.extend(_.clone(modelData), data) : modelData || {};
	},
	
	// Whether specified identity is a className, class, dictionary, or instance,
	// return an instance
	_provisionInstance: function (identity, identitySet, identityPrototype) {
		
		// Create an instance if necessary
		if (identity && _.isObject(identity) && _.isFunction(identity)) {
			// Function (class definition)
			return new identity({
				// While not necessary for everything, setting autorender to false
				// doesn't hurt, and takes care of anything that DOES render
				autorender: false
			});
		}
		else if (_.isString(identity)) {
			// A string component name			
			if (!identitySet[identity]) {
				throw new Error("No identity with that name ("+identity+") exists!");
			}
			return new identitySet[identity];
		}
		else if (_.isObject(identity)) {
			// an attribute list
			if (!identity.cid) {
				try {
					return new identityPrototype(identity);
				}
				catch (e) {
					debug.error("Invalid identity definition: "+identity);
				}
			}
		}
		
		// Else already a Mast component instance, in which case we're good.
		return identity;
	}
}