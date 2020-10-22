# `req.url`

Like [`req.path`](https://sailsjs.com/documentation/reference/request-req/req-path), but it also includes the query string suffix.

```usage
req.url;

// => "/search?q=worlds%20largest%20dogs"
```


### Notes
> + It is worth mentioning that the URL fragment/hash (e.g. "#some/clientside/route") part of the URL is [not available on the server](https://github.com/strongloop/express/issues/1083#issuecomment-5179035). This is an [open issue with the current HTTP specification](http://stackoverflow.com/a/2305927/486547). As a result, if you write an action to redirect from one subdomain to another, for instance, you won't be able to peek at the URL fragment in that action.
> + However, if you respond with a 302 redirect (i.e. `res.redirect()`), the user agent on the other end will preserve the URL fragment/hash and tack it on to the end of the new redirected URL.  In many cases, this is exactly what you want!



<docmeta name="displayName" value="req.url">
<docmeta name="pageType" value="property">

