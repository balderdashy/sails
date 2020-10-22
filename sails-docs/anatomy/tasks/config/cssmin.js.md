# tasks/config/cssmin.js

This file configures a Grunt task called "cssmin".

It minifies the intermediate, concatenated CSS stylesheet which was prepared by the `concat` task at `.tmp/public/concat/production.css`.  Together with the `concat` task, this is the final step that minifies all CSS files from `assets/styles/` (and potentially your LESS importer file from `assets/styles/importer.less`).

### Usage

For additional usage documentation, see [`grunt-contrib-cssmin`](https://npmjs.com/package/grunt-contrib-cssmin).


<docmeta name="displayName" value="cssmin.js">
