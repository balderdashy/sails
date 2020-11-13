# views/pages/homepage.ejs

This is the actual template that is rendered by default when a user visits the base URL of your lifted app.  Notice the file extension?  It stands for [Embedded JavaScript](http://ejs.co/).  EJS is what Sails uses by default to render server side HTML views.  This can be changed in `config/views.js`.

If a new view you've created isn't rendering, make sure you've hooked it up in your `config/routes.js`.

If you're used to putting all your HTML in a single file, this might look funny.  You might be thinking "Where are the head and body tags"?  The answer is, `views/layouts/layout.ejs`.


<docmeta name="displayName" value="homepage.ejs">
