# assets/templates/

Client-side HTML templates are important prerequisites for certain types of modern, rich client applications built for browsers; particularly [SPAs](https://en.wikipedia.org/wiki/Single-page_application). To work their magic, frameworks like Backbone, Angular, Ember, and Knockout require that you load templates client-side; completely separate from your traditional [server-side views](https://sailsjs.com/documentation/concepts/views).  Out of the box, new Sails apps support the best of both worlds.

Whether or not you use client-side templates in your app and where you put them is, of course, completely up to you.  But for the sake of convention, new apps generated with Sails include a `templates/` folder for you by default.


### How do I use these templates?

By default, your Gruntfile is configured to automatically load and precompile
client-side JST templates in your `assets/templates` folder, then
include them in your `layout.ejs` view automatically (between TEMPLATES and TEMPLATES END).

    <!--TEMPLATES-->

    <!--TEMPLATES END-->

This exposes your HTML templates as precompiled functions on `window.JST` for use from your client-side JavaScript.

To customize this behavior to fit your needs, just edit your Gruntfile.
For example, here are a few things you could do:

- Import templates from other directories
- Use a different template engine (handlebars, jade, dust, etc)
- Internationalize your client-side templates using a server-side stringfile before they're served.


For more information, check out the conceptual documentation on the [default Grunt tasks](https://sailsjs.com/documentation/concepts/assets/default-tasks) that make up Sails' asset pipeline.

<docmeta name="displayName" value="templates">

