# Default tasks

### Overview

The asset pipeline bundled in Sails is a set of Grunt tasks configured with conventional defaults designed to make your project more consistent and productive. The entire frontend asset workflow is completely customizable, while providing some default tasks out of the box. Sails makes it easy to [configure new tasks](https://sailsjs.com/documentation/concepts/assets/task-automation#?task-configuration) to fit your needs.


Here are a few things that the default Grunt configuration in Sails does to help you out:
- Automatic LESS compilation
- Cache busting
- Optional automatic asset injection, minification, and concatenation
- Creation of a web ready public directory
- File watching and syncing
- Transpilation of client-side JavaScript in production to allow use of >=ES6 syntax while maintaining broad browser compatibility
- Optimization of assets in production


### Default Grunt tasks

Below is a list of the Grunt tasks that are included by default in new Sails projects:

##### clean

> This grunt task is configured to clean out the contents in the `.tmp/public/` of your Sails project.

> [usage docs](https://github.com/gruntjs/grunt-contrib-clean)

##### hash

> Creates and adds an unique hash to the end of a filename for cache busting.

> [usage docs](https://github.com/jgallen23/grunt-hash/tree/0.5.0#grunt-hash)

##### concat

> Concatenates JavaScript and CSS files, and saves concatenated files in `.tmp/public/concat/` directory.

> [usage docs](https://github.com/gruntjs/grunt-contrib-concat)

##### copy

> **dev task config**
>
> Copies all directories and files, except coffeescript and less files, from the sails assets folder into the `.tmp/public/` directory.

> **build task config**
>
> Copies all directories and files from the .tmp/public directory into a www directory.

> [usage docs](https://github.com/gruntjs/grunt-contrib-copy)

##### cssmin

> Minifies CSS files and places them into `.tmp/public/min/` directory.

> [usage docs](https://github.com/gruntjs/grunt-contrib-cssmin)

##### less

> Compiles LESS files into CSS. Only the `assets/styles/importer.less` is compiled. This allows you to control the ordering yourself (i.e. import your dependencies, mixins, variables, resets, etc. before other stylesheets).

> [usage docs](https://github.com/gruntjs/grunt-contrib-less)

##### sails-linker

> Automatically inject `<script>` tags for JavaScript files and `<link>` tags for CSS files.  Also automatically links an output file containing precompiled templates using a `<script>` tag. A much more detailed description of this task can be found [here](https://github.com/balderdashy/sails-generate-frontend/blob/master/docs/overview.md#a-litte-bit-more-about-sails-linking), but the big takeaway is that script and stylesheet injection is *only* done in files containing `<!--SCRIPTS--><!--SCRIPTS END-->` and/or `<!--STYLES--><!--STYLES END-->` tags.  These are included in the default **views/layouts/layout.ejs** file in a new Sails project.  If you don't want to use the linker for your project, you can simply remove those tags.

> [usage docs](https://github.com/Zolmeister/grunt-sails-linker)

##### sync

> A grunt task to keep directories in sync. It is very similar to grunt-contrib-copy but tries to copy only those files that have actually changed. It specifically synchronizes files from the `assets/` folder to `.tmp/public/`, overwriting anything that's already there.

> [usage docs](https://github.com/tomusdrw/grunt-sync)

##### babel

> This grunt task is configured to transpile any >=ES6 syntax in your front-end Javascript files into code compatible with older browsers.

> [usage docs](https://github.com/babel/grunt-babel)

##### uglify

> Minifies client-side JavaScript assets.  Note that by default, this task will "mangle" all of your function and variable names (either by changing them to a much shorter name, or stripping them entirely).  This is usually desirable as it makes your code significantly smaller, but in some cases can lead to unexpected results (particularly when you expect an object's constructor to have a certain name).  To turn off or modify this behavior, [use the `mangle` option](https://www.npmjs.com/package/uglify-es#mangle-properties-options) when setting up this task.

> [usage docs](https://github.com/gruntjs/grunt-contrib-uglify/tree/harmony)

##### watch

> Runs predefined tasks whenever watched file patterns are added, changed, or deleted. Watches for changes on files in the `assets/` folder, and re-runs the appropriate tasks (e.g. LESS compilation).  This allows you to see changes to your assets reflected in your app without having to restart the Sails server.

> [usage docs](https://github.com/gruntjs/grunt-contrib-watch)


<docmeta name="displayName" value="Default tasks">
