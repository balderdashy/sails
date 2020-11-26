# `req.wantsJSON`

A flag indicating whether the requesting client would prefer a JSON response (as opposed to some other format, like XML or HTML.)

`req.wantsJSON` is used by all of the [built-in custom responses](https://sailsjs.com/documentation/anatomy/api/responses) in Sails.


### Usage
```usage
req.wantsJSON;
```

### Details

The intended purpose of `req.wantsJSON` is to provide a clean, reusable indication of whether the server should respond with JSON or send back something else. It's not the right answer for _every_ content negotiation problem, but it is a simple, go-to solution for most use cases.

For instance, all major browsers set an "Accept: text/plain;" request header for requests typed in the URL field.  In this case, `req.wantsJSON` is false.  For many other cases, though, the distinction is less clear.  In those scenarios, Sails uses heuristics to determine the best value for `req.wantsJSON`.

Technically, `req.wantsJSON` inspects the request's `"Content-type"`, `"Accepts"`, and `"X-Requested-With"` headers to determine whether the request expects a JSON response.  If the information in these headers is too scanty, Sails errs on the side of JSON, and `req.wantsJSON` will be set to `true`.

The benefit of `req.wantsJSON` is that it future-proofs your app and makes it less brittle. As best practices for content negotiation change over time (e.g. a new type of consumer device or enterprise user agent introduces a new header), Sails can patch `req.wantsJSON` at the framework level and modify the heuristics accordingly. It also reduces code duplication and saves you the annoyance of manually inspecting the headers in each of your routes.

### Example
```javascript
if (req.wantsJSON) {
  sails.log('This request wants JSON!');
}
else {
  // `req.wantsJSON` is falsy (undefined), to this request must not want JSON.
}
```

### Details

Here is the specific order in which `req.wantsJSON` inspects the request.  **If any of the following match, subsequent checks are ignored.**

A request "wantsJSON" if:

+ it looks like an AJAX request
+ it's a virtual request from a socket
+ the request DOESN'T explicitly want HTML
+ the request has a "json" content type AND has its "Accept" header set
+ `req.options.wantsJSON` is truthy

### Notes
> + Lower-level content negotiation is, of course, still possible using `req.is()`, `req.accepts()`, `req.xhr`, and `req.get()`.
> + As of Sails v0.10, requests originating from a WebSocket client always want JSON.


<docmeta name="displayName" value="req.wantsJSON">
<docmeta name="pageType" value="property">

