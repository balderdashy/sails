/**
 * Backbrace.js
 * (c) 2011 Mike McNeil
 * Backbrace may be freely distributed under the MIT license.
 *
 * Backbrace.js is freely distributable under the terms of the MIT license.
 * dependencies:
 * backbone.js
 * underscore.js
 * jquery
 */

//
// When you extend this class:
//
// 1) set this.el = a form selector
//
// 2) set this.model = the backbone class name of your model (i.e. Message)
//
// 3) There is a map "rules" in the backbone model.  List them in order of display preference
//
// 4) All form fields must have classes 'field' and $fieldName where $fieldname == the corresponding
//		attribute in the backbone model.  If you assign a validation rule that and $fieldName
//		which is not in the model, you can still use custom validation (things like reentering your password)
//
// 5) Override decorateField and undecorateField to control what happens when an error is detected (and resolved)
//
// 6) Override handleForm to control your form's submit behavior
//
/**
 *
 *
 * events ->
 *	decorateField
 *	undecorateField
 *	submit
 *	error
 *
 * Methods ->
 *	reset
 */
Backbone.Form = Backbone.View.extend({

	// The jQuery.data key to use on form inputs (associates them w/ model)
	dataKey: 'backbraceinput',

	// Set to true to validate after an field's onblur event
	validateOnBlur: true,


	//////////////////////////////////////////////////////////////////////////
	// Public events
	//////////////////////////////////////////////////////////////////////////
	/**
	 * Presentation logic for error reporting
	 * element -> the form element that is naughty
	 * error   -> the string key of the validation fail that was triggered
	 *				( i.e. required, email, url, minLength, etc. )
	 *
	 *	Some sensible defaults are included here that depend on the
	 *	form convention outlined in example.html.
	 */
	decorateField: function(element,error) {
		try {
			element.addClass('error');
			element.parent().addClass('error');
			element.parent().children('span.validation-message').addClass('error popped').text(error[0].message);
		}
		catch (e) {
			var msg =
			"Trying to use default behavior of backbrace,"+
			" but there was an error when highlighting "+
			"a field.\n"+
			"If you don't want to use backbrace form conventions, "+
			"you must override highlightField.\n"
			if (typeof console!="undefined")
				console.log(msg,e);
			else alert(msg);
			throw e;
		}
	},
	undecorateField: function(element,error) {
		
		try {
			var fresh = !element.data("fresh");
			element.removeClass('error');
			element.parent().removeClass('error');
			var validationMsg = element.parent().children('span.validation-message').addClass('error');

			if (!fresh)
				validationMsg.text('');
			else
				element.data("fresh",true)
		}
		catch (e) {
			var msg =
			"Trying to use default behavior of backbrace,"+
			" but there was an error when unhighlighting "+
			"a field."+
			"If you don't want to use backbrace form conventions, "+
			"you must override unhighlightField."
			if (typeof console!="undefined")
				console.log(msg,e);
			else alert(msg);
			throw e;
		}
	},

	/**
	 * Submit-- fired when form is successfully submitted
	 */
	submit: function() {

		// Override this with a method that handles the form here.
		alert("Backbrace default form handler triggered.");

		// To allow traditional form submission, return true
		// Default is to override
		return false;
	},
	/**
	 * Error-- fired when form submission is attempted, but fails
	 */
	error: function () {
	},


	//////////////////////////////////////////////////////////////////////////
	// Public actions
	//////////////////////////////////////////////////////////////////////////

	// Lift validation restriction for the given named field
	liftRule: function (fieldName) {
		this.model.rules[fieldName] = {};
	},
	// Impose validation restriction for the given named field
	imposeRule: function (fieldName, newRule) {
		this.model.rules[fieldName] = newRule;
	},

	// Reset the form
	reset: function () {

		// update selector
		if (this.selector)
			this.el = $(this.selector);
		else
			this.el = $(this.el);

		// Populate fields
		// TODO: switch to iterating through form inputs instead
		var view = this;
		_.each(this.model.rules,function (value,field) {
			var element = view.el.find(".field."+field);
			element.data(view.dataKey,field);
			view.fields[field]=element;
		})
		 
		// reset form validation
		this.undecorateField(this.el.find('.field'))

		// reassign events
		this.delegateEvents();
	},

	// Trigger the form's submit event
	// attach callback to end of submit event
	doSubmit: function (callback) {
		if (callback)
			this.attachedCallback = callback;
		else this.attachedCallback = null;
		
		if (this.el.submit) {
			console.log("this.el has submit",this.el)
			this.el.submit();
		}
		else {
			console.log("this.el needed $",this.el)
			$(this.el).submit();
		}
	},




	////////////////////////////////////////////////
	events: {
		"focus .field": "focusField",
		"blur .field": "blurField",
		"change .field":"changeField",
		"submit":"trySubmit"
	},
	fields: {},
	initialize: function () {
		this.model = new (this.model)()
		this.reset();
		_.bindAll(this);
	},
	focusField: function (e) {
		this.undecorateField($(e.currentTarget));
	},
	blurField: function (e) {
		if (this.validateOnBlur) {
			this.validateField($(e.currentTarget));
		}
	},
	changeField: function (e) {
//		if (this.validateOnBlur) {
//			this.validateField($(e.currentTarget));
//		}
	},
	trySubmit: function(e) {
		if (!this.validateFields()) {
			
			// Perform the attached callback if it was included
			// instead of the default submit behavior
			if (this.attachedCallback) {
				if (this.attachedCallback())
					return true;
				else this.error();
			}
			else if (this.submit()) {
				return true;
			}
		}
		else
			this.error();

		// Prevent form submission
		e.preventDefault();
		return false;
	},
	validateField: function(element) {
		var field = element.data(this.dataKey),
		input = this.fields[field],
		error;
		if (field) {
			error = this.model.validateOne(field,input.val());

			// Lookup rule
			var rule = this.model.rules[field];

			// Allow user to override destination element
			if (rule && rule.displayField) {
				this.renderField(error,this.fields[rule.displayField],field);
			}
			else 
				this.renderField(error,input,field);
		}
		return !field || error;
	},
	renderField: function(error,elem,field) {
		if (error) {
			if (! _.isArray(error))
				error = [error];
			this.decorateField(elem,error);
		}
		else
			this.undecorateField(elem,error);
	},
	validateFields: function () {
		// Get values from form
		var view = this;
		var data= {},
		hasError = false;
		_.each(this.model.rules,function (rule,field) {
			var elem = view.el.find(".field."+field);

			// More than one field with that name exists
			if (elem.length > 1) {
			// TODO
			//				_.each(elem,function (e) {
			//					hasError = view.validateField(e) || hasError;
			//				})
			}
			// Only one exists
			else {
				hasError = view.validateField(elem) || hasError;
				data[field] = view.el.find(".field."+field).val();
			}
		});
		this.model.set(data);
		return hasError;
	}
});




// Extensions to the model that support validation
Backbone.Model = Backbone.Model.extend({

	// 
	validateOne: function (field,value) {
		var rule = this.rules[field];
		if (!rule || _.isEmpty(rule)) {
			return null;
		}
		var result = this.runValidationFn(this.attributes,rule,field,value);
		return result;
	},
	
	// Validate a field for one or more rules
	runValidationFn: function (attributes,rule,fieldName,value) {
		// Parse rule name, get options if they exist
		// If this is a list of rules, evaluate each rule
		if (_.isArray(rule)) {
			var errors = [];
			for (var i=0;i<rule.length;i++) {
				var error=this.runValidationFn(attributes,rule[i],fieldName,value);
				if (error)
					errors.push(error);
			}
			return (errors.length > 0) ? errors : false;
		}
		// Evaluate an individual rule
		else {
			var ruleName,options={};
			if (_.isString(rule)) {
				ruleName=rule;
			}
			else {
				ruleName = rule.name;
				options = _.extend(options,rule);
			}
			// Add all new values to options
			options = _.extend(options,{
				newValues: attributes
			});
			if (!this.validators[ruleName])
				throw new Error ("Unknown validation function ("+ruleName+")!");
			else {
				return this.validators[ruleName](fieldName,this,value,options);
			}
		}
	},

	// adapted from https://github.com/n-time/backbone.validation/blob/master/backbone.validations.js
	validators: {
		// Error map
		errors: {
			required: {
				message: 'That field is required.'
			},
			email: {
				message: 'Invalid email.'
			},
			url: {
				message: 'Invalid URL.'
			},
			naturalNumber: {
				message: 'Invalid amount.'
			},
			pattern: {
				message: 'pattern'
			},
			min: {
				message: 'Too small.'
			},
			max: {
				message: 'Too big.'
			},
			minlength: {
				message: 'Too short.'
			},
			maxlength: {
				message: 'Too long.'
			},
			minCount: {
				message: 'Too few.'
			},
			maxCount: {
				message: 'Too many.'
			}
		},
		custom : function(attributeName, model, valueToSet,options) {
			return model[options.methodName](attributeName, valueToSet);
		},
		required : function(attributeName, model, valueToSet,options) {
			var currentValue = model.get(attributeName);
			var isNotAlreadySet = _.isUndefined(currentValue);
			var isNotBeingSet = _.isUndefined(valueToSet);
			if (_.isNull(valueToSet) || valueToSet === "" || (isNotBeingSet && isNotAlreadySet)) {
				return _.extend(this.errors.required,options);
			}
			return false;
		},
		email : function(attributeName, model, valueToSet) {
			var emailRegex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");

			if (_.isString(valueToSet) && !valueToSet.match(emailRegex)) {
				return this.errors.email;
			} else return false;
		},
		url : function(attributeName, model, valueToSet) {
			var urlRegex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
			if (_.isString(valueToSet) && !valueToSet.match(urlRegex)) {
				return this.errors.url;
			} else return false;
		},
		naturalNumber : function (attributeName, model, valueToSet,options) {
			var naturalRegex = /^(0|([1-9][0-9]*))$/;
			if (!valueToSet.match(naturalRegex)) {
				
				return this.errors.naturalNumber;
			} else return false;
		},
		pattern : function(attributeName, model, valueToSet,options) {
			if (_.isString(valueToSet)) {
				if (valueToSet.match(options.pattern)) {

					return false;
				} else {
					if (options.message)
						return {
							message: options.message
						};
					else
						return this.errors.pattern;
				}
			} else return false;
		},
		min : function(attributeName, model, valueToSet,options) {
			valueToSet = +valueToSet;
			if (valueToSet < options.min) {
				return _.extend(this.errors.min,options);
			} else return false;
		},
		max : function(attributeName, model, valueToSet,options) {
			valueToSet = +valueToSet;
			if (valueToSet > options.max) {
				return _.extend(this.errors.max,options);
			} else return false;
		},
		minlength : function( attributeName, model, valueToSet,options) {
			if (_.isString(valueToSet)) {
				if (valueToSet.length < options.minlength) return this.errors.minlength;
			}
			return false;
		},
		maxlength : function( attributeName, model, valueToSet,options) {
			if (_.isString(valueToSet)) {
				if (valueToSet.length > options.maxlength) return this.errors.maxlength;
			}
			return false;
		}
	}
});



// Bonus?
// This should probably be put somewhere else,
// but it's included because it's userful
// Adds a max and minimum to backbone collections
Backbone.Collection = Backbone.Collection.extend({
	max: 100,
	min: 0,
	// Add without overflowing
	safeAdd: function (o) {
		if (this.length < this.max) {
			this.add(o);
			if (this.length==this.max && this.onFull) this.onFull();
			return true;
		} else return false;
	},
	// Remove without overflowing
	safeRemove: function (o) {
		if (o && o.length && this.length-o.length >= this.min) {
			this.remove(o);
			return true;
		}
		else if (o && this.length-1 >= this.min) {
			this.remove(o)
			return true;
		}
		else
			return false;
	}
})