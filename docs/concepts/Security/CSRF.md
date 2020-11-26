# CSRF

Cross-site request forgery ([CSRF](https://www.owasp.org/index.php/Cross-Site_Request_Forgery)) is a type of attack which forces an end user to execute unwanted actions on a web application backend with which he/she is currently authenticated.  In other words, without protection, cookies stored in a browser like Google Chrome can be used to send requests to Chase.com from a user's computer whether that user is currently visiting Chase.com or Horrible-Hacker-Site.com.

### About CSRF tokens

CSRF tokens are like limited-edition swag.  While a session tells the server that a user "is who they say they are", a csrf token tells the server they "were where they say they were".  When CSRF protection is enabled in your Sails app, all non-GET requests to the server must be accompanied by a special "CSRF token", which can be included as either the '_csrf' parameter or the 'X-CSRF-Token' header.

Using tokens protects your Sails app against cross-site request forgery (or CSRF) attacks. A would-be attacker needs not only a user's session cookie, but also this timestamped, secret CSRF token, which is refreshed/granted when the user visits a URL on your app's domain.  This allows you to have certainty that your users' requests haven't been hijacked, and that the requests they're making are intentional and legitimate.

Enabling CSRF protection requires managing the token in your front-end app.  In traditional form submissions, this can be easily accomplished by sending along the CSRF token as a hidden input in your `<form>`.  Or better yet, include the CSRF token as a request param or header when you send AJAX requests.  To do that, you can either fetch the token by sending a request to the route where you mounted `security/grant-csrf-token`, or better yet, harvest the token from view locals using the `exposeLocalsToBrowser` partial.

Here are some examples:

#### (a) For modern, view-driven hybrid apps that submit forms with AJAX:
Use the `exposeLocalsToBrowser` partial to provide access to the token from
your client-side JavaScript, e.g.:
```html
<%- exposeLocalsToBrowser() %>
<script>
  $.post({
    foo: 'bar',
    _csrf: window.SAILS_LOCALS._csrf
  })
</script>
```

#### (b) For single-page apps with static HTML:
Fetch the token by sending a GET request to the route where you mounted
the `security/grant-csrf-token`.  It will respond with JSON, e.g.:
```js
{ _csrf: 'ajg4JD(JGdajhLJALHDa' }
```

#### (c) For traditional HTML form submissions:
Render the token directly into a hidden form input element in your HTML, e.g.:
```html
<form>
  <input type="hidden" name="_csrf" value="<%= _csrf %>" />
</form>
```

### Enabling CSRF protection

Sails bundles optional CSRF protection out of the box. To enable the built-in enforcement, just make the following adjustment to [sails.config.security.csrf](https://sailsjs.com/docs/reference/configuration/sails-config-security-csrf) (conventionally located in your project's [`config/security.js`](https://sailsjs.com/anatomy/config/security-js) file):

```js
csrf: true
```

You can also turn CSRF protection on or off on a per-route basis by adding `csrf: true` or `csrf: false` to any route in your [`config/routes.js`](https://sailsjs.com/anatomy/config/routes-js) file.

Note that if you have existing code that communicates with your Sails backend via POST, PUT, or DELETE requests, you'll need to acquire a CSRF token and include it as a parameter or header in those requests.  More on that in a sec.



### CSRF tokens

Like most Node applications, Sails and Express are compatibile with Connect's [CSRF protection middleware](http://www.senchalabs.org/connect/csrf.html) for guarding against such attacks.  This middleware implements the [Synchronizer Token Pattern](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29_Prevention_Cheat_Sheet#General_Recommendation:_Synchronizer_Token_Pattern).  When CSRF protection is enabled, all non-GET requests to the Sails server must be accompanied by a special token, identified by either a header or a parameter in the query string or HTTP body.

CSRF tokens are temporary and session-specific; e.g. Imagine Mary and Muhammad are both shoppers accessing our e-commerce site running on Sails, and CSRF protection is enabled.  Let's say that on Monday, Mary and Muhammad both make purchases.  In order to do so, our site needed to dispense at least two different CSRF tokens- one for Mary and one for Muhammad.  From then on, if our web backend received a request with a missing or incorrect token, that request will be rejected. So now we can rest assured that when Mary navigates away to play online poker, the 3rd party website cannot trick the browser into sending malicious requests to our site using her cookies.

### Dispensing CSRF tokens

To get a CSRF token, you should either bootstrap it in your view using [locals](https://sailsjs.com/documentation/concepts/views/locals) (good for traditional multi-page web applications) or fetch it using AJAX from a special protected JSON endpoint (handy for single-page-applications (SPAs).)


##### Using view locals:

For old-school form submissions, it's as easy as passing the data from a view into a form action.  You can grab hold of the token in your view, where it may be accessed as a view local: `<%= _csrf %>`

e.g.:
```html
<form action="/signup" method="POST">
 <input type="text" name="emailaddress"/>
 <input type='hidden' name='_csrf' value='<%= _csrf %>'>
 <input type='submit'>
</form>
```
If you are doing a `multipart/form-data` upload with the form, be sure to place the `_csrf` field before the `file` input, otherwise you run the risk of a timeout and a 403 firing before the file finishes uploading.





##### Using AJAX/WebSockets

In AJAX/Socket-heavy apps, you might prefer to get the CSRF token dynamically rather than having it bootstrapped on the page.  You can do so by setting up a route in your [`config/routes.js`](https://sailsjs.com/anatomy/config/routes-js) file pointing to the `security/grant-csrf-token` action:

```json
{
  'GET /csrfToken': { action: 'security/grant-csrf-token' }
}
```

Then send a GET request to the route you defined, and you'll get CSRF token returned as JSON, e.g.:

```json
{
  _csrf: 'ajg4JD(JGdajhLJALHDa'
}
```

> For security reasons, you can&rsquo;t retrieve a CSRF token via a socket request.  You can however _spend_ CSRF tokens (see below) via socket requests.
> The `security/grant-csrf-token` action is not intended to be used in cross-origin requests, since some browsers block third-party cookies by default.  See the [CORS documentation](https://sailsjs.com/documentation/concepts/security/cors) for more info about cross-origin requests.



### Spending CSRF tokens

Once you've enabled CSRF protection, any POST, PUT, or DELETE requests (**including** virtual requests, e.g. from Socket.io) made to your Sails app will need to send an accompanying CSRF token as a header or parameter.  Otherwise, they'll be rejected with a 403 (Forbidden) response.

For example, if you're sending an AJAX request from a webpage with jQuery:
```js
$.post('/checkout', {
  order: '8abfe13491afe',
  electronicReceiptOK: true,
  _csrf: 'USER_CSRF_TOKEN'
}, function andThen(){ ... });
```

With some client-side modules, you may not have access to the AJAX request itself. In this case, you can consider sending the CSRF token directly in the URL of your query. However, if you do so, remember to URL-encode the token before spending it:
```js
..., {
  checkoutAction: '/checkout?_csrf='+encodeURIComponent('USER_CSRF_TOKEN')
}
```



### Notes

> + You can choose to send the CSRF token as the `X-CSRF-Token` header instead of the `_csrf` parameter.
> + For most developers and organizations, CSRF attacks need only be a concern if you allow users to log into/securely access your Sails backend _from the browser_ (i.e. from your HTML/CSS/JavaScript front-end code). If you _don't_ (e.g. users only access the secured sections from your native iOS or Android app), it is possible you don't need to enable CSRF protection.  Why?  Because technically, the common CSRF attack discussed on this page is only _possible_ in scenarios where users use the _same client application_ (e.g. Chrome) to access different web services (e.g. Chase.com, Horrible-Hacker-Site.com.)
> + For more information on CSRF, check out [Wikipedia](http://en.wikipedia.org/wiki/Cross-site_request_forgery)
> + For "spending" CSRF tokens in a traditional form submission, refer to the example above (under "Using view locals".)


<docmeta name="displayName" value="CSRF">
