# Actions and controllers

### Overview

_Actions_ are responsible for responding to *requests* from a web browser, mobile application or any other system capable of communicating with a server.  They often act as a middleman between your [models](https://sailsjs.com/documentation/concepts/models-and-orm) and [views](https://sailsjs.com/documentation/concepts/views), and orchestrate the bulk of your project&rsquo;s [business logic](http://en.wikipedia.org/wiki/Business_logic): you can use actions to serve web pages, handle form submissions, manage 3rd party API requests, and everything in between.

Actions are bound to [routes](https://sailsjs.com/documentation/concepts/Routes) in your application. When a user agent requests a particular URL, the action bound to that route performs the business logic within and sends back a response.  For example, the `GET /hello` route in your application could be bound to an action like:

```javascript
async function (req, res) {
  return res.send('Hi there!');
}
```

Any time a web browser navigates to the `/hello` URL on your app's server, the page will display the message: &ldquo;Hi there!&rdquo;.

### Defining your action
Actions are defined in the `api/controllers/` folder and subfolders (we&rsquo;ll talk more about _controllers_ in a bit). In order for Sails to recognize a file as an action, the filename must be _kebab-cased_ (containing only lowercase letters, numbers and dashes).  When referencing an action in Sails (in most cases, when [binding it to a route](https://sailsjs.com/documentation/concepts/routes/custom-routes#?action-target-syntax)), use its path relative to `api/controllers`, without any file extension.  For example, to bind a route to an action located at `api/controllers/user/find.js`, you would point its URL to `user/find`.

##### File extensions for actions

By default, Sails only knows how to interpret `.js` files, but you can customize your app to use things like [CoffeeScript](https://sailsjs.com/documentation/tutorials/using-coffee-script) or [TypeScript](https://sailsjs.com/documentation/tutorials/using-type-script) as well. An action can have any file extension that isn't `.md` (Markdown) and `.txt` (text).

### Creating an action

Action files can use one of two formats: _actions2_ (recommended) or _classic_.

##### actions2

Since the release of Sails v1.0, we recommend writing your actions in the more modern "actions2" syntax, which works much the same way as Sails [helpers](https://sailsjs.com/documentation/concepts/helpers). By defining your actions in this way, they are essentially self-documenting and self-validating.

Using actions2 provides several advantages:

+ You can use [`sails generate action`](https://sailsjs.com/documentation/reference/command-line-interface/sails-generate) to quickly create an actions2 file
+ You can clearly define the names and types of the request parameters the action expects, and those parameters will be automatically validated before the action is run
+ All of the possible outcomes of running the action (`exits`) are clearly visible, without the need to dissect the code
+ The code you write is not directly dependent on `req` and `res`, making it easier to re-use or abstract into a [helper](https://sailsjs.com/documentation/concepts/helpers)
> Note that when using actions2, you can access the [request object](https://sailsjs.com/documentation/reference/request-req) as `this.req`.</br>Alternatively, you can pass `env` into the function with `inputs` and `exits` to get access to `req` without using `this.req`.

In a nutshell, your code will be standardized in a way that makes it easier to re-use and modify later.  And since you'll declare the action's parameters ahead of time, you'll be much less likely to expose edge cases and security holes.

Here's an example of the actions2 format:

```javascript
module.exports = {

  friendlyName: 'Welcome user',

  description: 'Look up the specified user and welcome them, or redirect to a signup page if no user was found.',

  inputs: {
    userId: {
      description: 'The ID of the user to look up.',
      // By declaring a numeric example, Sails will automatically respond with `res.badRequest`
      // if the `userId` parameter is not a number.
      type: 'number',
      // By making the `userId` parameter required, Sails will automatically respond with
      // `res.badRequest` if it's left out.
      required: true
    }
  },

  exits: {
    success: {
      responseType: 'view',
      viewTemplatePath: 'pages/welcome'
    },
    notFound: {
      description: 'No user with the specified ID was found in the database.',
      responseType: 'notFound'
    }
  },

  fn: async function ({userId}) {

    // Look up the user whose ID was specified in the request.
    // Note that we don't have to validate that `userId` is a number;
    // the machine runner does this for us and returns `badRequest`
    // if validation fails.
    var user = await User.findOne({ id: userId });

    // If no user was found, respond "notFound" (like calling `res.notFound()`)
    if (!user) { throw 'notFound'; }

    // Display a personalized welcome view.
    return {
      name: user.name
    };
  }
};
```

> Sails uses the [machine-as-action](https://github.com/treelinehq/machine-as-action) module to automatically create route-handling functions out of actions formatted like the example above.  See the [machine-as-action docs](https://github.com/treelinehq/machine-as-action#customizing-the-response) for more information.

###### Exit signals

In an action, helper, or script, throwing anything will trigger the `error` exit by default. If you want to trigger any other exit, you can do so by throwing a "special exit signal". This will either be a string (the name of the exit), or an object with the name of the exit as the key and the output data as the value.
For example, instead of the usual syntax:

```javascript
return exits.hasConflictingCourses();
```

You could use the shorthand:

```javascript
throw 'hasConflictingCourses';
```

Or, to include output data:

```javascript
throw { hasConflictingCourses: ['CS 301', 'M 402'] };
```

Aside from being an easy-to-read shorthand, exit signals are especially useful if you're inside of a `for` loop, `forEach`, etc., but still want to exit through a particular exit.


##### Classic actions

If you're working with an existing codebase or an app that was upgraded from v0.12, you may be more used to the classic action format. Classic actions are declared as functions with `req` and `res` arguments. When a client requests a route bound to this type of action, the function runs using the [incoming request object](https://sailsjs.com/documentation/reference/request-req) as the first argument (`req`), and the [outgoing response object](https://sailsjs.com/documentation/reference/response-res) as the second argument (`res`).

Here's a sample action that looks up a user by ID, then either displays a "welcome" view or redirects to a signup page if the user can't be found:

```javascript
module.exports = async function welcomeUser (req, res) {

  // Get the `userId` parameter from the request.
  // This could have been set on the querystring, in
  // the request body, or as part of the URL used to
  // make the request.
  var userId = req.param('userId');

   // If no `userId` was specified, or it wasn't a number, return an error.
  if (!_.isNumeric(userId)) {
    return res.badRequest(new Error('No user ID specified!'));
  }

  // Look up the user whose ID was specified in the request.
  var user = await User.findOne({ id: userId });

  // If no user was found, redirect to signup.
  if (!user) {
    return res.redirect('/signup' );
  }

  // Display the welcome view, setting the view variable
  // named "name" to the value of the user's name.
  return res.view('welcome', {name: user.name});

}
```

> You can use [`sails generate action`](https://sailsjs.com/documentation/reference/command-line-interface/sails-generate) with `--no-actions2` to quickly create a classic action.


### Controllers

For simpler projects and prototypes, often the quickest way to get started writing Sails apps is to organize your actions into _controller files_.  A controller file is a [_PascalCased_](https://en.wikipedia.org/wiki/PascalCase) file whose name must end in `Controller`, containing a dictionary of actions.  For example, a  "User Controller" could be created at `api/controllers/UserController.js` file containing:

```javascript
module.exports = {
  login: function (req, res) { ... },
  logout: function (req, res) { ... },
  signup: function (req, res) { ... },
};
```

You can use [`sails generate controller`](https://sailsjs.com/documentation/reference/command-line-interface/sails-generate#?sails-generate-controller-foo-action-1-action-2) to quickly create a controller file.

##### File extensions for controllers

Just like with action files, you can customize your app to use things like [CoffeeScript](https://sailsjs.com/documentation/tutorials/using-coffee-script) or [TypeScript](https://sailsjs.com/documentation/tutorials/using-type-script), although Sails only knows how to interpret `.js` files by default. A controller can have any file extension besides `.md` (Markdown) and `.txt` (text).


### Standalone actions

For larger, more mature apps, _standalone actions_ may be a better approach than controller files.  In this scheme, rather than having multiple actions living in a single file, each action is in its own file in an appropriate subfolder of `api/controllers`.  For example, the following file structure would be equivalent to the  `UserController.js` file:

```
api/
 controllers/
  user/
   login.js
   logout.js
   signup.js
```

Using standalone actions has several advantages over controller files:

+ It's easier to see a clear overview of the actions in your app, because you can reference your project's file structure instead of scanning through individual controller files
+ Each action file is smaller and easy to maintain, whereas controller files tend to grow as your app grows
+ [Routing to standalone actions](https://sailsjs.com/documentation/concepts/routes/custom-routes#?action-target-syntax) in nested subfolders is more intuitive than routing to actions in controller files (`foo/bar/baz.js` vs. `foo/BarController.baz`)
+ Blueprint index routes apply to top-level standalone actions, so you can create an `api/controllers/index.js` file and have it automatically bound to your app&rsquo;s `/` route (as opposed to creating an arbitrary controller file to hold the root action)


### Keeping it lean

In the tradition of most MVC frameworks, mature Sails apps usually have "thin" controllers&mdash;that is, your action code ends up lean because reusable code has been moved into [helpers](https://sailsjs.com/documentation/concepts/helpers) or occasionally even extracted into separate node modules.  This approach can definitely make your app easier to maintain as it grows in complexity.

But at the same time, extrapolating code into reusable helpers _too_ early can cause maintenance issues that waste time and productivity.  The right answer lies somewhere in the middle.

Sails recommends this general rule of thumb:  **wait until you're about to use the same piece of code for the _third_ time before you extrapolate it into a separate helper.**  But, as with any dogma, use your judgement!  If the code in question is very long or complex, then it might make sense to pull it out into a helper much sooner.  Conversely, if you know what you're building is a quick, throwaway prototype, you might just copy and paste the code to save time.

> Whether you're developing for passion or profit, at the end of the day, the goal is to make the best possible use of your time as an engineer.  Some days that means getting more code written, and other days it means looking out for the long-term maintainability of the project.  If you're not sure which of these goals is more important at your current stage of development, you might take a step back and give it some thought (better yet, have a chat with the rest of your team or [other folks building apps on Node.js/Sails](https://sailsjs.com/support)).

<docmeta name="displayName" value="Actions and controllers">
<docmeta name="nextUpLink" value="/documentation/concepts/views">
<docmeta name="nextUpName" value="Views">
