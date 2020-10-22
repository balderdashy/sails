# Task automation

### Overview

The [`tasks/`](https://sailsjs.com/documentation/anatomy/tasks) directory contains a suite of [Grunt tasks](http://gruntjs.com/creating-tasks) and their [configurations](http://gruntjs.com/configuring-tasks).

Tasks are mainly useful for bundling front-end assets, (like stylesheets, scripts, & client-side markup templates) but they can also be used to automate all kinds of repetitive development chores, from [browserify](https://github.com/jmreidy/grunt-browserify) compilation to [database migrations](https://www.npmjs.org/package/grunt-db-migrate).

Sails bundles some [default tasks](https://sailsjs.com/documentation/grunt/default-tasks) for convenience, but with [literally hundreds of plugins](http://gruntjs.com/plugins) to choose from, you can use tasks to automate just about anything with minimal effort.  If someone hasn't already built what you need, you can always [author](http://gruntjs.com/creating-tasks) and [publish your own Grunt plugin](http://gruntjs.com/creating-plugins) to [npm](http://npmjs.org)!

> If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.


### Asset pipeline

The asset pipeline is the place where you will organize the assets that will be injected into your views, and it can be found in the `tasks/pipeline.js` file. Configuring these assets is simple and uses Grunt [task file configuration](http://gruntjs.com/configuring-tasks#files) and [wildcard/glob/splat patterns](http://gruntjs.com/configuring-tasks#globbing-patterns). These are broken down into three sections:

##### CSS Files to Inject
This is an array of CSS files to be injected into your HTML as `<link>` tags.  These tags will be injected between the `<!--STYLES--><!--STYLES END-->` comments in any view in which they appear.

##### JavaScript Files to Inject
This is an array of JavaScript files that gets injected into your HTML as `<script>` tags.  These tags will be injected between the `<!--SCRIPTS--><!--SCRIPTS END-->` comments in any view in which they appear. The files get injected in the order in which they appear in the array, meaning you should place the path of dependencies before the file that depends on them.

##### Template Files to Inject
This is an array of HTML files that will compiled to a JST function and placed in a jst.js file. This file then gets injected as a `<script>` tag in between the `<!--TEMPLATES--><!--TEMPLATES END-->` comments in your HTML.

> The same Grunt wildcard/glob/splat patterns and task file configuration are used in some of the task configuration JS files themselves if you would like to change those too.

### Task configuration

Configured tasks are the set of rules your Gruntfile will follow when run. They are completely customizable and are located in the [`tasks/config/`](https://sailsjs.com/documentation/anatomy/my-app/tasks/config) directory. You can modify, omit, or replace any of these Grunt tasks to fit your requirements. You can also add your own Grunt tasks&mdash;just add a `someTask.js` file in this directory to configure the new task, then register it with the appropriate parent task(s) (see files in `tasks/register/*.js`). Remember, Sails comes with a set of useful default tasks that are designed to get you up and running with no configuration required.

##### Configuring a custom task.

Configuring a custom task into your project is very simple and uses Grunt&rsquo;s [config](http://gruntjs.com/api/grunt.config) and [task](http://gruntjs.com/api/grunt.task) APIs to allow you to make your task modular. Let&rsquo;s go through a quick example of creating a new task that replaces an existing task. Suppose we want to use the [Handlebars](http://handlebarsjs.com/) templating engine instead of the underscore templating engine that comes configured by default:

* The first step is to install the Handlebars Grunt plugin using the following command in your terminal:

```bash
npm install grunt-contrib-handlebars --save-dev
```

* Next, create a configuration file at `tasks/config/handlebars.js`. This is where we&rsquo;ll put our Handlebars configuration.

```javascript
// tasks/config/handlebars.js
// --------------------------------
// handlebar task configuration.

module.exports = function(grunt) {

  // We use the grunt.config api's set method to configure an
  // object to the defined string. In this case the task
  // 'handlebars' will be configured based on the object below.
  grunt.config.set('handlebars', {
    dev: {
      // We will define which template files to inject
      // in tasks/pipeline.js
      files: {
        '.tmp/public/templates.js': require('../pipeline').templateFilesToInject
      }
    }
  });

  // load npm module for handlebars.
  grunt.loadNpmTasks('grunt-contrib-handlebars');
};
```

* Replace the path to source files in asset pipeline. The only change here will be that Handlebars looks for files with the extension .hbs while underscore templates can be in simple HTML files.

```javascript
// tasks/pipeline.js
// --------------------------------
// asset pipeline

var cssFilesToInject = [
  'styles/**/*.css'
];

var jsFilesToInject = [
  'js/socket.io.js',
  'js/sails.io.js',
  'js/connection.example.js',
  'js/**/*.js'
];

// We change this glob pattern to include all files in
// the templates/ direcotry that end in the extension .hbs
var templateFilesToInject = [
  'templates/**/*.hbs'
];

module.exports = {
  cssFilesToInject: cssFilesToInject.map(function(path) {
    return '.tmp/public/' + path;
  }),
  jsFilesToInject: jsFilesToInject.map(function(path) {
    return '.tmp/public/' + path;
  }),
  templateFilesToInject: templateFilesToInject.map(function(path) {
    return 'assets/' + path;
  })
};
```

* Include the Handlebars task into the compileAssets and syncAssets registered tasks. This is where the JST task was being used; we will now replace it with the newly configured Handlebars task.

```javascript
// tasks/register/compileAssets.js
// --------------------------------
// compile assets registered grunt task

module.exports = function (grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    'handlebars:dev',       // changed jst task to handlebars task
    'less:dev',
    'copy:dev',
    'coffee:dev'
  ]);
};

// tasks/register/syncAssets.js
// --------------------------------
// synce assets registered grunt task

module.exports = function (grunt) {
  grunt.registerTask('syncAssets', [
    'handlebars:dev',      // changed jst task to handlebars task
    'less:dev',
    'sync:dev',
    'coffee:dev'
  ]);
};
```

* Remove JST task config file. We are no longer using it so we can get rid of `tasks/config/jst.js`. Simply delete it from your project.

> Ideally you should delete it from your project and your project's Node dependencies. This can be done by running this command in your terminal:
```bash
npm uninstall grunt-contrib-jst --save-dev
```

### Task triggers

In [development mode](https://next.sailsjs.com/documentation/reference/configuration/sails-config#?sailsconfigenvironment), Sails runs the `default` task ([`tasks/register/default.js`](https://sailsjs.com/documentation/anatomy/tasks/register/default.js)).  This compiles LESS, CoffeeScript, and client-side JST templates, then links to them automatically from your app's dynamic views and static HTML pages.

In production, Sails runs the `prod` task ([`tasks/register/prod.js`](https://sailsjs.com/documentation/anatomy/tasks/register/prod.js)) which shares the same duties as `default`, but also minifies your app's scripts and stylesheets.  This reduces your application's load time and bandwidth usage.

These task triggers are ["basic" Grunt tasks](http://gruntjs.com/creating-tasks#basic-tasks) located in the [`tasks/register/`](https://sailsjs.com/documentation/anatomy/tasks/register) folder.  Below, you'll find the complete reference of all task triggers in Sails, and the command which kicks them off:

##### `sails lift`

Runs the **default** task (`tasks/register/default.js`).

##### `sails lift --prod`

Runs the **prod** task (`tasks/register/prod.js`).

##### `sails www`

Runs the **build** task (`tasks/register/build.js`) that compiles all the assets to `www` subfolder instead of `.tmp/public` using relative paths in references. This allows serving static content with Apache or Nginx instead of relying on ['www middleware'](https://sailsjs.com/documentation/concepts/Middleware).

##### `sails www --prod` (production)

Runs the **buildProd** task (`tasks/register/buildProd.js`) that does the same as **build** task but also optimizes assets.

You may run other tasks by specifying setting NODE_ENV and creating a task list in tasks/register/ with the same name.  For example, if NODE_ENV is QA, sails will run tasks/register/QA.js if it exists.


<docmeta name="displayName" value="Task automation">
