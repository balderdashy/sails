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
}