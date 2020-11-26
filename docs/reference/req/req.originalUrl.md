# `req.originalUrl`

From the [Express docs](https://expressjs.com/en/4x/api.html#req.originalUrl):

> This property is much like req.url; however, it retains the original request URL, allowing you to rewrite req.url freely for internal routing purposes.

In almost all cases, you&rsquo;ll want to use [`req.url`](https://sailsjs.com/documentation/reference/request-req/req-url) instead.  In the rare cases where `req.url` is modified (for example, inside of a policy or middleware in order to redirect to an internal route), `req.originalUrl` will give you the URL that was originally requested.

```usage
req.originalUrl;

// => "/search"
```

<docmeta name="displayName" value="req.originalUrl">
<docmeta name="pageType" value="property">

