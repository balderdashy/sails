# Partials

When using the default view engine (`ejs`), Sails supports the use of _partials_ (i.e. "view partials").  Partials are basically just views that are designed to be used from within other views.

They are particularly useful for reusing the same markup between different views, layouts, and even other partials.

```ejs
<%- partial('./partials/navbar.ejs') %>
```

This should render the partial located at `views/partials/navbar.ejs`, which might look something like this:

```ejs
<%
/**
 * views/partials/navbar.ejs
 *
 * > Note: This EJS comment won't show up in the ejs served to the browser.
 * > So you can be as verbose as you like.  Just be careful not to inadvertently
 * > type a percent sign followed by a greater-than sign (it'll bust you out of
 * > the EJS block).
 *
 */%>
<nav class="navbar">
  <a href="/">Dashboard</a>
  <a href="/inbox">Inbox</a>
</nav>
```


The target path that you pass in as the first argument to `partial()` should be relative from the view, layout, or partial where you call it.  So if you are calling `partial()` from within a view file located at `views/pages/dashboard/user-profile.ejs`, and want to load `views/partials/widget.ejs` then you would use:

```ejs
<%- partial('../../partials/navbar.ejs') %>
```

### Partials and view locals

Partials automatically inherit the view locals that are available wherever they are used.  For example, if you call `partial()` within a view where a variable named `currentUser` is available, then `currentUser` will also be available within the partial:

```ejs
<%
/**
 * views/partials/navbar.ejs
 *
 * The navbar at the top of the page.
 *
 * @needs {Dictionary} currentUser
 *   @property {Boolean} isLoggedIn
 *   @property {String} username
 */%>
<nav class="navbar">
  <div class="links">
    <a href="/">Dashboard</a>
    <a href="/inbox">Inbox</a>
  </div>
  <span class="login-or-signup"><%
  // If the user accessing this page is logged in...
  if (currentUser.isLoggedIn) {
  %>
    You are signed in as <a href="/<%= currentUser.username %>"><%= currentUser.username %></a>.
  <%
  }
  // Otherwise the user accessing this page must be a visitor:
  else {
  %>
    <a href="/login">Log in</a>
  <%
  }
  %>
  </span>
</nav>
```


### Overriding locals in a partial

Automatic inheritance of view locals takes care of most use cases for partials, but sometimes you might want to pass in additional, dynamic data.  For example, imagine your app has duplicate copies of the following code in a few different views:

```ejs
<%
// A list representing the currently-logged in user's inbox.
%><ul class="message-list"><%
  // Display each message, with a button to delete it.
  _.each(messages, function (message) {
  %><li class="inbox-message" data-id="<%= message.id %>">
    <a href="/messages/<%= message.id %>"><%= message.subject %></a>
    <button class="fa fa-trash" is="delete-btn"></button>
  </li><% });
 %></ul>
```

To refactor this, you might extrapolate the `<li>` into a partial to avoid duplicating code.  But if we do that, _we cannot rely on automatic inheritance_.  Partials only inherit locals that are available to the view, partial, or layout where they're called as a whole, but this `<li>` relies on a variable called `message`, which comes from the call to [`_.each()`](https://lodash.com/docs/3.10.1#forEach).

Fortunately, Sails also allows you to pass in an optional dictionary (i.e. a plain JavaScript object) of overrides as the second argument to `partial()`:

```
<%- partial(relPathToPartial, optionalOverrides) %>
```

These overrides will be accessible in the partial as local variables, where they will take precedence over any automatically inherited locals with the same variable name.

Here's our example from above, refactored to take advantage of this:

```ejs
<%
// A list representing the currently-logged in user's inbox.
%><ul class="message-list"><%
  // Display each message, with a button to delete it.
  _.each(messages, function (message) { %>
  <%- partial ('../partials/inbox-message.ejs', { message: message }) %>
  <% });
%></ul>
```


And finally, here is our new partial representing an individual inbox message:

```ejs
/**
 * views/partials/inbox-message.ejs
 *
 * An individual inbox message.
 *
 * @needs {Dictionary} message
 *   @property {Number} id
 *   @property {String} subject
 *
 */%>
<li class="inbox-message" data-id="<%= message.id %>">
  <a href="/messages/<%= message.id %>"><%= message.subject %></a>
  <button class="fa fa-trash" is="delete-btn" aria-label="Delete"></button>
</li>
```







### Notes

> + Partials are rendered synchronously, so they will block Sails from serving more requests until they're done loading.  It's something to keep in mind while developing your app, especially if you anticipate a large number of connections.
> + Built-in support for partials in Sails is only for the default view engine, `ejs`.  If you decide to customize your Sails install and use a view engine other than `ejs`, then please be aware that support for partials (sometimes known as "blocks", "includes", etc.) may or may not be included, and that the usage will vary.  Refer to the documentation for your view engine of choice for more information on its syntax and conventions.


<docmeta name="displayName" value="Partials">

