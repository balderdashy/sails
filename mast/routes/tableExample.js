var tableExample = function(query,page){
			
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