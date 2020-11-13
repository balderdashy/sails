# app.js

This file is the conventional entry point for a _production_ Sails/Node.js app.

When developing on your local computer, and you run `sails lift`, the code in `app.js` is not executed.  Instead, this file exists to provide an easy, out-of-the-box way to run your app _without_ typing `sails lift`.  This is most likely how you'll start your app in production (i.e. `node app`, or `npm start`).

For example, when you deploy to most PaaS vendors like [Heroku](http://heroku.com), they will automatically detect that you're running a Sails/Node.js app and execute this file with the `NODE_ENV` environment variable set to production.

> Whatever stage of the development lifecycle you're at, you can safely ignore `app.js`.  It's good to go out of the box for most apps.  But the code in `app.js` also serves as an easy-to-reference example of how to use Sails programmatically.  So you might want to take a look at it if you plan on writing automated tests, scheduled jobs, manual database migrations, or administration scripts.


<docmeta name="displayName" value="app.js">
