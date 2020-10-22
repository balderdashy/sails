# tasks/

The `tasks/` directory is a suite of Grunt tasks and their configurations, bundled for your convenience.  The Grunt integration is mainly useful for bundling front-end assets (like stylesheets, scripts and markup templates), but it can also be used to run all kinds of development tasks, from browserify compilation to database migrations.

If you haven't used [Grunt](http://gruntjs.com/) before, that's OK!  For many common use cases, you can get by without customizing or even looking at the files in this folder.  If you do need to customize something, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains basic concepts like the [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as how to install and use Grunt plugins. Once you're familiar with that process, read on!


### How does this work?

The asset pipeline bundled in Sails is a set of Grunt tasks configured with conventional defaults designed to make your project more consistent and productive.

The entire front-end asset workflow in Sails is completely customizable-- while it provides some suggestions out of the box, Sails makes no pretense that it can anticipate all of the needs you'll encounter building the browser-based/front-end portion of your application.  Who's to say you're even building an app for a browser?


### What tasks does Sails run automatically?

Sails runs some of these tasks (certain ones in the `tasks/register/` folder) automatically when you run certain commands.

###### `sails lift`

Runs the `default` task (`tasks/register/default.js`).

###### `sails lift --prod`

Runs the `prod` task (`tasks/register/prod.js`).

###### `sails www`

Runs the `build` task (`tasks/register/build.js`).

###### `sails www --prod` (production)

Runs the `buildProd` task (`tasks/register/buildProd.js`).


### Can I customize this for SASS, Angular, client-side Jade templates, etc?

You can modify, omit, or replace any of these Grunt tasks to fit your requirements. You can also add your own Grunt tasks- just add a `someTask.js` file in the `grunt/config` directory to configure the new task, then register it with the appropriate parent task(s) (see files in `grunt/register/*.js`).


### Do I have to use Grunt?

Nope!  The Sails core team has used Grunt on real-world projects for upwards of 4 years now, and overall it's been a fantastic tool.  But we realize it's not for everyone.  To disable Grunt integration in Sails, just delete your Gruntfile or [disable the Grunt hook](https://sailsjs.com/documentation/concepts/assets/disabling-grunt).

> You can also [generate a new Sails app `--without=grunt`](https://sailsjs.com/documentation/reference/command-line-interface/sails-new).


### What if I'm not building a web frontend?

That's ok! A core tenant of Sails is client-agnosticism-- it's especially designed for building APIs used by all sorts of clients; native Android/iOS/Cordova, serverside SDKs, etc.

You can completely disable Grunt by following the instructions [here](https://sailsjs.com/documentation/concepts/assets/disabling-grunt).

If you still want to use Grunt for other purposes, but don't want any of the default web front-end stuff, just delete your project's `assets` folder and remove the front-end oriented tasks from the `grunt/register` and `grunt/config` folders.  You can also run `sails new myCoolApi --no-frontend` to omit the `assets` folder and front-end-oriented Grunt tasks for future projects.  You can also replace your `sails-generate-frontend` module with alternative community generators, or create your own.  This allows `sails new` to create the boilerplate for native iOS apps, Android apps, Cordova apps, SteroidsJS apps, etc.

> If you know you'll _never_ need any kind of web frontend, you can also [generate a new Sails app with `--no-frontend` at all](https://sailsjs.com/documentation/reference/command-line-interface/sails-new).


### More info

> More information on using Grunt to work with static assets: http://gruntjs.com/configuring-tasks



<docmeta name="displayName" value="tasks">

