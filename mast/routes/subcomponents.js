Mast.routes.subcomponents = function(query,page){
			
	// Empty container
	$(".sandbox").empty();
	
	
				
	// Now let's try creating a Table
	// A Table is basically just a Component which contains 
	// a homogenous list of sub-Components
	tc = new Mast.components.TestTableWithSubcomponents();
	

	// Finally, let's create another button for the user to go back
	// to the previous example		
	new Mast.Button({
		label: '< Previous: Tables',
		click: function(e) {
			Mast.navigate('tableExample');
		},
		outlet: '.sandbox'
	});
}