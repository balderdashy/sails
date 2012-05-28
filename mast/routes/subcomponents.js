Mast.routes.subcomponents = function(query,page){
			
	// Empty container
	$(".sandbox").empty();
	

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