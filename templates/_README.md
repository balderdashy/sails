----------------------------
What is this?
----------------------------

The "templates" directory is used in the accompanying client-side Mast framework.

When Sails fires up, all the files in this directory are compiled into "_compiled.ejs".
Then, the layout.ejs file imports this view partial inside of a hidden 
#mast-template-library element.  

If you are NOT planning on using Mast, you can delete that element in layout.ejs.