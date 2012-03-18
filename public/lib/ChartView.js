var ChartView = Backbone.View.extend({
	events: {},
	initialize: function (options) {
		// Use ChartView class to register instances of initialized chartviews
		ChartView.register(this);

		_.bindAll(this);
		_.extend(this,options);
	},

	// defaults
	width: 400,
	height:300,
	title: 'No title specified',

	// Rows are of the form:
	// [  [ 'Mushrooms',3 ], [ 'Onions', 1 ]   ]
	rows: [],

	// Columns are of the form:
	// {
	//		Topping: 'string',
	//		Slices: 'number'
	// }
	columns: { },

	// Fired when google is ready-
	// Triggered by static method in ChartView class that is called
	// by an inline script in the view
	googleReady: function () {
		$(this.domReady);
	},

	// Fired when document is ready
	// (must wait until after google is ready)
	domReady: function () {
		if (!this.el || $(this.el).length < 1) {
		// Chart container has not been specified.
		}
		else {
			this.el = $(this.el);

			// Finally, create the chart
			this.drawChart()
		}
	},

	// Initial draw
	// Creates and populates a data table,
	// instantiates the pie chart, passes in the data and
	// draws it.
	drawChart: function() {

		// Build empty rowset
		var emptyData = []
		for (var r in this.rows) {
			var emptyRow = [this.rows[r][0],0];
			emptyData.push(emptyRow);
		}
		
		// Create the data table.
		var data = new google.visualization.DataTable();
		for (var column in this.columns) {
			data.addColumn(this.columns[column], column);
		}
		data.addRows(this.rows);

		// Set chart options
		var options = {
			'title':this.title,
			'width':this.width,
			'height':this.height,
//			'colors':[
//				'#E10019',
//				'#496A9A',
//				"#888888",
//				"#EEEEEE",
//				"#444444"
//			],
			'is3D':true
		};
		

		// Start off chart at 0 (so we get a nice initial animation)
		this.chart = new google.visualization.PieChart(this.el.get(0));

		// Assign listener to chart ready event (presently unused)
		google.visualization.events.addListener(this.chart, 'ready', function () {});

		this.chart.draw(data, options);
	}
});

// ChartView class tracks all active instances of UI component
ChartView.instances = []
ChartView.register = function (chartView) {
	ChartView.instances.push(chartView);
}
ChartView.googleReady = function () {
	// Iterate through registered chart instances and fire googleReady events
	for (var view in ChartView.instances) {
		ChartView.instances[view].googleReady();
	}
}