# assets/styles/importer.less

By default, new Sails projects are configured to compile this file from LESS to CSS.  Unlike CSS files, LESS files are not compiled and included automatically unless they are imported here.

The LESS files imported in this file are compiled and included in the order they are listed.  Mixins, variables, etc. should be imported first so that they can be accessed by subsequent LESS stylesheets.

(Just like the rest of the asset pipeline bundled in Sails, you can always omit, customize, or replace this behavior with SASS, SCSS, or any other Grunt tasks you like.)


<docmeta name="displayName" value="importer.less">
