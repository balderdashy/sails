Mast.models.ToDo = Mast.Model.extend({
    defaults: function(){
        return {
//            order       : Mast.models.ToDoList.nextOrder(),
            done        : false,
            todoTitle   : ""
        }
    },
    
    toggle: function() {
      this.set({done: !this.get("done")});  
    }
});

Mast.models.ToDoList = Mast.Collection.extend({
    model: Mast.models.ToDo
});

