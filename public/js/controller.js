// Define global Router and Socket event handlers
var AppController = {
			
	// Default route
	index: function(query,page) {
				
		// Empty container
		$(".sandbox").empty();
				

		// Create some components
		a=new ComponentA;	
		b=new ComponentB;


		// When you create a new Component, it renders to the DOM automatically
		// And subsequently, you don't have to force a component to render-- 
		// it'll do it on its own when its Pattern (template or model) changes.


		// First, let's try changing the model
		// an event is created at the model and bubbles up to the view
		a.set('name','Changed THING1\'s model.');
		b.set('name','Changed THING2\'s model.');


		// Now let's change the template-- notice how the DOM automatically updates
		// This is great for instances when a whole bunch of HTML needs to change 
		a.setTemplate('.test1');
		b.setTemplate('.test1');

		// You can render components as many times as you want!
		a.render();
		a.render();
		a.render();
		a.render();
		a.render();
				
		// OK that was fun-- so lets move on to another example
		// We'll create a "Next Example" link
		// which will use the Mast.Router to manage the browser history stack
		// and move on to the next stage of the example app		
		new Mast.Button({
			label: 'Next experiment >',
			click: function(e) {
				Mast.navigate('tableExample');
			},
			outlet: '.sandbox'
		});
	},
			
			
	tableExample: function(query,page){
			
		// Empty container
		$(".sandbox").empty();
				
		// Now let's try creating a Table
		// A Table is basically just a Component which contains 
		// a homogenous list of sub-Components
		t = new TestTable();
				
		// Now append the table to its outlet.
		// We could have just created the table normally,
		// but I wanted to demonstrate how to disable autorender.
		t.append();

		// Finally, let's create another button for the user to go back
		// to the previous example		
		new Mast.Button({
			label: '< Previous experiment',
			click: function(e) {
				Mast.navigate('index');
			},
			outlet: '.sandbox'
		});
	}
}