# XSS

Cross-site scripting (XSS) is a type of attack in which a malicious agent manages to inject client-side JavaScript into your website, so that it runs in the trusted environment of your users' browsers.


### Protecting against XSS attacks

The cleanest way to prevent XSS attacks is to escape untrusted data _at the point of injection_.  That means at the point where it's actually being injected into the HTML.


#### On the server

##### When injecting data into a server-side view...

Use `<%= %>` to HTML-encode data:

```html
<h3 is="welcome-msg">Hello <%= me.username %>!</h3>

<h4><%= owner.username %>'s projects:</h4>
<ul><% _.each(projects, function (project) { %>
  <li>
    <a href="/<%= owner.username %>/<%= project.slug %>"><%= project.friendlyName %></a>
  </li>
<% }); %></ul>
```

##### When exposing view locals to client-side JavaScript...

Use the `exposeLocalsToBrowser` partial to safely expose some or all of your view locals to client-side JavaScript:

```html
<%- exposeLocalsToBrowser(); %>

<script>
console.log(window.SAILS_LOCALS);
// {
//   me: {
//     username: 'eleven',
//     memberSince: '1982-08-01T05:00:00.000Z'
//   },
//   owner: {
//     username: 'joyce',
//     memberSince: '1987-11-03T05:00:00.000Z'
//   },
//   projects: [
//     {
//       slug: 'my-neat-stuff-n-things',
//       friendlyName: 'My neat stuff & things',
//       description: 'Yet another project.'
//     },
//     {
//       slug: 'kind-of-neat-stuff-but-not-that-great',
//       friendlyName: 'Kind of neat stuff, but not that great...',
//       description: 'I am so sick and tired of these project. <script>alert(\'attack\');</script>'
//     }
//   ],
//   _csrf: 'oon95Uac-wKfWQKC5pHx1rP3HsiN9tjqGMyE'
// }
</script>
```

> Note that when you use this strategy, the strings in your view locals are no longer HTML unescaped after being exposed to client-side JavaScript.
> That's because you'll want to escape them _again_ when you stick them in the DOM.  If you always escape at the point of injection, this stuff is a
> lot easier to keep track of.  This way, you know you can safely escape _any_ string you inject into the DOM from your client-side JavaScript.
> (More on that below.)


#### On the client

A lot of XSS prevention is about what you do in your client-side code.  Here are a few examples:

##### When injecting data into a client-side JST template...

Use `<%- %>` to HTML-encode data:

```html
<div data-template-id="welcome-box">
  <h3 is="welcome-msg">Hello <%- me.username %>!</h3>
</div>
```


##### When modifying the DOM with client-side JavaScript...

Use something like `$(...).text()` to HTML-encode data:

```js
var $welcomeMsg = $('#signup').find('[is="welcome-msg"]');
welcomeMsg.text('Hello, '+window.SAILS_LOCALS.me.username+'!');

// Avoid using `$(...).html()` to inject untrusted data.
// Even if you know an XSS is not possible under particular circumstances,
// accidental escaping issues can cause really, really annoying client-side bugs.
```

> As you've probably figured out, the example above assumes you are using jQuery, but the same concepts apply regardless of what front-end library you are using.


### Additional Resources
+ [XSS (OWasp)](https://www.owasp.org/index.php/XSS)
+ [XSS Prevention Cheatsheet](https://www.owasp.org/index.php/XSS_Prevention_Cheat_Sheet)


### Notes

> + The examples above assume you are using the default view engine (EJS) and client-side JST/Lodash templates from the default asset pipeline.


<docmeta name="displayName" value="XSS">
