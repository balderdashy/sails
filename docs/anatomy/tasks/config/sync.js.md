# tasks/config/sync.js


This file configures a Grunt task called "sync".

This task synchronizes one directory with another (like rsync).  In the default Sails asset pipeline, it plays a very similar role to `tasks/config/copy.js`, but copies only those files that have actually changed since the last time the task was run.

Specifically, its job is to synchronize files from the `assets/` folder to `.tmp/public`, smashing anything that's already there.


### Usage

For additional usage documentation, see [`grunt-sync`](https://www.npmjs.com/package/grunt-sync).


<docmeta name="displayName" value="sync.js">
