# Views
### Overview

In Sails, views are markup templates that are compiled _on the server_ into HTML pages.  In most cases, views are used as the response to an incoming HTTP request, e.g. to serve your home page.

> Much more rarely, you can also compile a view directly into an HTML string for use in your backend code (see [`sails.renderView()`](https://github.com/balderdashy/sails/blob/master/docs/PAGE_NEEDED.md)).  For instance, you might use this approach to send HTML emails, or to build big XML strings for use with a legacy API.


##### Creating a view

By default, Sails is configured to use EJS ([Embedded Javascript](http://ejs.co/)) as its view engine.  The syntax for EJS is highly conventional; if you've worked with php, asp, erb, gsp, jsp, etc., you'll immediately know what you're doing.

If you prefer to use a different view engine, there are a multitude of options.  Sails supports all of the view engines compatible with [Express](http://expressjs.com/en/guide/using-template-engines.html) via [Consolidate](https://github.com/visionmedia/consolidate.js).

Views are defined in your app's [`views/`](https://sailsjs.com/documentation/anatomy/views) folder by default, but like all of the default paths in Sails, they are [configurable](https://sailsjs.com/documentation/reference/configuration/sails-config-views).  If you don't need to serve dynamic HTML pages at all (say, if you're building an API for a mobile app), you can remove the directory from your app.

##### Compiling a view

Anywhere you can access the `res` object (e.g. a controller action, custom response, or policy), you can use [`res.view`](https://sailsjs.com/documentation/reference/response-res/res-view) to compile one of your views, then send the resulting HTML down to the user.

You can also hook up a view directly to a route in your `routes.js` file.  Just indicate the relative path to the view from your app's `views/` directory.  For example:

```javascript
{
  'get /': {
    view: 'pages/homepage'
  },
  'get /signup': {
    view: 'pages/signup/basic-info'
  },
  'get /signup/password': {
    view: 'pages/signup/choose-password'
  },
  // and so on.
}
```

##### What about single-page apps?

If you are building a web application for the browser, part (or all) of your navigation may take place on the client; i.e. instead of the browser fetching a new HTML page each time the user navigates around, the client-side code preloads some markup templates which are then rendered in the user's browser without needing to hit the server again directly.

In this case, you have a couple of options for bootstrapping the single-page app:

+ Use a single view, e.g. `views/publicSite.ejs`.  The advantage of this option is that you can use the view engine in Sails to pass data from the server directly into the HTML that will be rendered on the client.  This is an easy way to get stuff like user data to your client-side JavaScript, without having to send AJAX/WebSocket requests from the client.
+ Use a single HTML page in your assets folder , e.g. `assets/index.html`.  Although you can't pass server-side data directly to the client this way, the advantage of this approach is that it allows you to further decouple the client and server-side parts of your application.

Note that anything in your assets folder can be moved to a static CDN (like Cloudfront or CloudFlare), allowing you to take advantage of that provider's geographically-distributed data centers to get your content closer to your users.



<docmeta name="displayName" value="Views">
<docmeta name="nextUpLink" value="/documentation/concepts/assets">
<docmeta name="nextUpName" value="Assets">
