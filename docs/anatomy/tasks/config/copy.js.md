# tasks/config/copy.js

This file configures a Grunt task called "copy".

Copy files and/or folders from your `assets/` directory into the web root (`.tmp/public`) so they can be served via HTTP, and also for further pre-processing by other Grunt tasks.

##### Normal usage (`sails lift`)
Copies all directories and files (except CoffeeScript and LESS) from the `assets/` folder into the web root -- conventionally a hidden directory located `.tmp/public`.

##### Via the `build` tasklist (`sails www`)
Copies all directories and files from the .tmp/public directory into a www directory.

### Usage

For additional usage documentation, see [`grunt-contrib-copy`](https://npmjs.com/package/grunt-contrib-copy).


<docmeta name="displayName" value="copy.js">
