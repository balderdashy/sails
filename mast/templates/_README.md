----------------------------
templates
----------------------------

What is this?
----------------------------

The "templates" directory is used in the accompanying client-side Mast framework,
but you can use it whether you are planning on using Mast or not.

When Sails fires up in production mode, all the css files in this directory are 
minified and compiled into app.css.  Then, the ejs templates are made available
as a view partial that creates a hidden #mast-template-library element for 
client-side templating.  