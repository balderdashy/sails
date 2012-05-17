----------------------------
components
----------------------------

What is this?
----------------------------

The "components" directory is used in the accompanying client-side Mast framework,
but you can use it whether you are planning on using Mast or not.

Then, all the files in this library are made available as a view partial to be included
in your layout.ejs file.  In production mode, they are minified.


Dependency management is not build into the framework at this time. 
However Mast, through extreme componentization, does a pretty good job of eliminating this problem on its own.

TODO: dependency management
I'm investigating the best way to offer dependency management, whether that's
through require.js or smart detection by examining Mast.Component.subcomponents.