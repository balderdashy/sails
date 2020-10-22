# Locals

The variables accessible in a particular view are called `locals`.  Locals represent server-side data that is _accessible_ to your view&mdash;locals are not actually _included_ in the compiled HTML unless you explicitly reference them using special syntax provided by your view engine.

```ejs
<div>Logged in as <a><%= user.fullName %></a>.</div>
```

### Using locals in your views

The notation for accessing locals varies between view engines.  In EJS, you use special template markup (e.g. `<%= someValue %>`) to include locals in your views.

There are three kinds of template tags in EJS:
+ `<%= someValue %>`
  + HTML-escapes the `someValue` local, and then includes it as a string.
+ `<%- someRawHTML %>`
  + Includes the `someRawHTML` local verbatim, without escaping it.
  + Be careful!  This tag can make you vulnerable to XSS attacks if you don't know what you're doing.
+ `<% if (!loggedIn) { %>  <a>Logout</a>  <% } %>`
  + Runs the JavaScript inside the `<% ... %>` when the view is compiled.
  + Useful for conditionals (`if`/`else`), and looping over data (`for`/`each`).


Here's an example of a view (`views/backOffice/profile.ejs`) using two locals, `user` and `corndogs`:

```ejs
<div>
  <h1><%= user.fullName %>'s first view</h1>
  <h2>My corndog collection:</h2>
  <ul>
    <% for (let corndog of corndogs) { %>
    <li><%= _.capitalize(corndog.name) %></li>
    <% } %>
  </ul>
</div>
```

> You might have noticed another local: `_`.  By default, Sails passes down a few locals to your views automatically, one of which is lodash (`_`).

If the data you wanted to pass down to this view was completely static, you wouldn't necessarily need a controller. Instead, you could hard-code the view and its locals in your `config/routes.js` file, like so:

```javascript
  // ...
  'get /profile': {
    view: 'backOffice/profile',
    locals: {
      user: {
        fullName: 'Frank',
        emailAddress: 'frank@enfurter.com'
      },
      corndogs: [
        { name: 'beef corndog' },
        { name: 'chicken corndog' },
        { name: 'soy corndog' }
      ]
    }
  },
  // ...
```

More likely, though, this data will be dynamic. In this scenario, we'd need to use a controller action to load the data from our models, then pass it to the view using the [res.view()](https://sailsjs.com/documentation/reference/response-res/res-view) method.

Assuming we hooked up our route to one of our controller's actions (and our models were set up), we might send down our view like this:

```javascript
// in api/controllers/UserController.js...

  profile: function (req, res) {
    // ...
    return res.view('backOffice/profile', {
      user: theUser,
      corndogs: theUser.corndogCollection
    });
  },
  // ...
```

### Escaping untrusted data using `exposeLocalsToBrowser`

It is often desirable to &ldquo;bootstrap&rdquo; data onto a page so that it&rsquo;s available via Javascript as soon as the page loads, rather than having to fetch the data in a separate AJAX or socket request.  Sites like [Twitter and GitHub](https://blog.twitter.com/2012/improving-performance-on-twittercom) rely heavily on this approach in order to optimize page load times and provide an improved user experience.

Historically, this problem was commonly solved using hidden form fields or by hand-rolling code that injected server-side locals directly into a client-side script tag.  While effective, these techniques can present challenges when some of the data to be bootstrapped is from an _untrusted_ source that might contain HTML tags and Javascript code meant to compromise your app with an <a href="https://en.wikipedia.org/wiki/Cross-site_scripting" target="_blank">XSS attack</a>.  To prevent situations like this, Sails provides a built-in view partial called `exposeLocalsToBrowser` that you can use to securely inject data from your view locals for access from client-side JavaScript.

To use `exposeLocalsToBrowser`, simply call it from within your view using the _non-escaping syntax_ for your template language.  For example, using the default EJS view engine:

```ejs
<%- exposeLocalsToBrowser() %>
```

By default, this exposes _all_ of your view locals as the `window.SAILS_LOCALS` global variable.  For example, if your action code contained:

```javascript
res.view('myView', {
  someString: 'hello',
  someNumber: 123,
  someObject: { owl: 'hoot' },
  someArray: [1, 'boot', true],
  someBool: false
  someXSS: '<script>alert("all your credit cards belong to me!!");</script>'
});
```

then using `exposeLocalsToBrowser` as shown above would cause the locals to be safely bootstrapped in such a way that `window.SAILS_LOCALS.someArray` would contain the array `[1, 'boot', true]`, and  `window.SAILS_LOCALS.someXSS` would contain the _string_ `<script>alert("all your credit cards belong to me!!");</script>` without causing that code to actually be executed on the page.

The `exposeLocalsToBrowser` function has a single `options` parameter that can be used to configure what data is outputted, and how.  The `options` parameter is a dictionary that can contain the following properties:

|&nbsp;   |     Property        | Type                                         | Default| Details                            |
|---|:--------------------|----------------------------------------------|:-----------------------------------|-----|
| 1 | _keys_     | ((array?))                              | `undefined` | A &ldquo;whitelist&rdquo; of locals to expose.  If left undefined, _all_ locals will be exposed.  If specified, this should be an array of property names from the locals dictionary.  For example, given the `res.view()` statement shown above, setting `keys: ['someString', 'someBool']` would cause `windows.SAILS_LOCALS` to be set to `{someString: 'hello', someBool: false}`.
| 2 | _namespace_ | ((string?)) | `SAILS_LOCALS` | The name of the global variable to which the bootstrapped data should be assigned.
| 3| _dontUnescapeOnClient_ | ((boolean?)) | false | **Advanced. Not recommended for most apps.** If set to `true`, any string values that were escaped to avoid XSS attacks will _still be escaped_ when accessed from client-side JS, instead of being transformed back into the original value.  For example, given the `res.view()` statement from the example above, using `exposeLocalsToBrowser({dontUnescapeOnClient: true})` would cause `window.SAILS_LOCALS.someXSS` to be set to `&lt;script&gt;alert(&#39;hello!&#39;);`.


<docmeta name="displayName" value="Locals">
