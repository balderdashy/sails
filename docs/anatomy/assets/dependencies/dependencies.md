# assets/dependencies/

As a rule of thumb, if it's code written by you or someone on your team, it _does not belong in this folder._  Instead, `assets/dependencies/` is for your client-side dependencies such as Vue.js, Bootstrap, or jQuery.  This folder can include client-side JavaScript files, stylesheets, and even images.  (See the "Web App" template for an example.)

JavaScript files and stylesheets in the `assets/dependencies/` folder are loaded first, before your other assets.  This conventional behavior is orchestrated by [tasks/pipeline.js](https://sailsjs.com/documentation/anatomy/tasks/pipeline.js), so head over there if you need to tweak this behavior (for example, if some of your client-side dependencies need to load before others.)

<docmeta name="displayName" value="dependencies">

