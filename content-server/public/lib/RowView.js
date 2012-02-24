var RowView = Backbone.View.extend({
	
	/////////////////////////////////////////////////////////////////
	// Must be implemented by child
	/////////////////////////////////////////////////////////////////
	open: function () {},
	markup: {},
	/////////////////////////////////////////////////////////////////

	originalOpacity: 0.75,

	events: {
		'click.row' : 'open',
		'mouseenter.row' : 'mouseenter',
		'mouseleave.row' : 'mouseleave'
	},

	initialize: function(options) {
		_.bindAll(this);
		this.model = options.model;
		this.containerEl = options.containerEl;
		this.collectionView = options.collectionView;
		this.el = null;
		
		// Add child's events
		if (this.events)
			this.events = _.defaults(this.events, RowView.prototype.events);

		$(this.ready);
	},

	ready: function () {
		
	},

	mouseenter: function () {
		if (!$(this.el).hasClass('selected')) {
			$(this.el).fadeTo(100,1);
		}
//		$(this.el).addClass("hovered");
	},
	mouseleave: function () {
		if (!$(this.el).hasClass('selected')) {
			$(this.el).fadeTo(100,this.originalOpacity);
		}
//		$(this.el).removeClass("hovered");
	},
	
	rerender: function (){
		var newElem = $(this.generateHTML());
		this.el.replaceWith(newElem);
		this.el = newElem;
		
		this.delegateEvents();
	},

	render: function (options) {
		// Redraw element
		var newElem;
		if (options && options.prepend) {
			newElem = $(this.generateHTML()).prependTo(this.containerEl);
		}
		else {
			newElem = $(this.generateHTML()).appendTo(this.containerEl);
		}
		this.el = newElem;
		$(this.el).fadeTo(1,this.originalOpacity);
		
		this.delegateEvents();
	},

	prepend: function () {
		var newElem = $(this.generateHTML()).prependTo(this.containerEl);
		this.el = newElem;
		this.delegateEvents();
	},

	// Return the HTML especially for this row
	generateHTML: function () {
		var template = this.markup.row;
		
		var map = _.clone(this.model.attributes);

		// Replace nulls with ""
		var copy = {};
		_.each(map,function(value,key) {
			copy[key] = (value === null) ? "" : value;
		});

		// Adapt specific attributes for this client view
		copy = this.transform(copy);
		return _.template(template,copy);
	},

	//  Adapt data-- 
	transform: function (map) {
		return map;
		
//		// by default, formats dates (can be overridden)
//		map.dateSent = moment(map.dateSent).from(moment());
//		map.dateModified = moment(map.dateModified).from(moment());
//		map.dateCreated = moment(map.dateCreated).from(moment());
//		return copy;
	},


	destroy: function (e) {
		// Id must be specified in order for backbone to talk to the server
		this.model.id = this.model.attributes.id;

		// Remove from server
		this.model.destroy();

		// Remove from DOM
		this.remove();
	},
	
	// Child should override
	markup: {
		row:'<li>content</li>',
		busy: '<li>busy....</li>'
	}
})