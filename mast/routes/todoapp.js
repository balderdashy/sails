Mast.routes.todoapp = function(query, page) {
    
    // Empty container
    $(".sandbox").empty();
    
    // create new todo list
    var todos = new Mast.components.ToDoList();
    
    // create back button
    var backButton = new Mast.Button({
        label: "< Previous: Subcomponents",
        click: function(e) {
            Mast.navigate("subcomponents");
        },
        outlet: ".sandbox"
    });   
}