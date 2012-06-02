Mast.models.ToDo = Mast.Model.extend({
    defaults: function(){
        return {
//            order       : Mast.models.ToDoList.nextOrder(),
            done        : false,
            todoTitle   : ""
        }
    },
    
    toogle: function() {
      this.set({done: !this.get("done")});  
    },
    
    clear: function() {
        this.destroy(); 
    }
});

Mast.models.ToDoList = Mast.Collection.extend({
    model: Mast.models.ToDo,
    
    // allows to add an order to each new todo item
//    nextOrder: function() {
//        if (!this.length) return 1;
//        return this.last().get("order") + 1;
//    },
    
    template: "#mast-template-todolist",
    
    outlet: ".sandbox"   
});

