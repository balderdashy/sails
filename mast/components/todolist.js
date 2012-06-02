Mast.components.ToDo = Mast.Component.extend({
   template : ".mast-template-todo",
   outlet   : "#todo-list"
   
});

Mast.components.ToDoList = Mast.Table.extend({
    template    : "#mast-template-todolist",
    outlet      : ".sandbox",
    collection  : "ToDoList",
    rowcomponent: "ToDo",
    rowoutlet   : "#todo-list",
    
    
    events: {
        'pressEnter': "addToDo"
    },
    
    // create new todo item in the collection
    addToDo: function(e) {
        // Create a new todo
        this.collection.add({
            todoTitle: this.$el.find('input').val()
        });
		
		// Clear input field
		this.$el.find('input').val('');
        
        e.stopImmediatePropagation();
        e.stopPropagation();
    },
    
    
    // see if a todo item is marked as done or not.
    done: function() {
        return this.filter(function(todo){ return todo.get('done'); });
    }
    
});


