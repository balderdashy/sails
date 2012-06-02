Mast.routes.demonstration = function(query,page){
			
	// Empty container
	$(".sandbox").empty();
	
	
	new Mast.components.Navbar();
	
	
	// Finally, let's create another button for the user to go back
	// to the previous example		
	new Mast.Button({
		label: '< Previous: Subcomponents',
		click: function(e) {
			Mast.navigate('subcomponents');
		},
		outlet: '.sandbox'
	});
}