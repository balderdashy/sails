# tasks/config/concat.js

This file configures a Grunt task called "concat".

It concatenates the contents of multiple JavaScript and/or CSS files into two new files, each located at `concat/production.js` and `concat/production.css` respectively in `.tmp/public/concat`.

This is used as an intermediate step to generate monolithic files that can then be passed in to `uglify` and/or `cssmin` for [minification](https://en.wikipedia.org/wiki/Minification_(programming)).


### Usage

For additional usage documentation, see [`grunt-contrib-concat`](https://npmjs.com/package/grunt-contrib-concat).


<docmeta name="displayName" value="concat.js">
