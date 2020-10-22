# `res.redirect()`

Redirect the requesting user agent to the given absolute or relative URL.


### Usage
```usage
return res.redirect(url);
```


_Or:_
+ `return res.redirect(statusCode, url);`

### Arguments

|   | Argument       | Type        | Details |
|---|----------------|:-----------:|---------|
| 1 | _statusCode_   | ((number?)) | An optional status code (e.g. 301).  (If omitted, a status code of 302 will be assumed.)
| 2 | url            | ((string))  | A URL expression (see below for complete specification).<br/> e.g. `"http://google.com"` or `"/login"`



### Details

Sails/Express support a few forms of redirection: 

+ A fully qualified URI for redirecting to a different domain:

```javascript
return res.redirect('http://google.com');
```

+ The domain-relative redirect.  For example, if you were on http://example.com/admin/post/new, the following redirect to `/checkout` would land you at http://example.com/checkout:

```javascript
return res.redirect('/checkout');
```

+ Pathname-relative redirects. If you were on http://example.com/admin/post/new, the following redirect would land you at http//example.com/admin/post:

```javascript
return res.redirect('..');
```
+ A back redirect, which allows you to redirect a request back from whence it came from using the "Referer" (or "Referrer") header (if omitted, redirects to `/` by default):

```javascript
return res.redirect('back');
```

### Notes
> + This method is **terminal**, meaning that it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).
> + As of Sails v1.x, for HTTP requests, `res.redirect()` [does not respect the status code established by `res.status()`](https://github.com/balderdashy/sails-docs/pull/796#issuecomment-284224746).  Thanks [@Guillaume-Duval](https://github.com/Guillaume-Duval) and [@oshatrk](https://github.com/oshatrk)!
> + When your app calls `res.redirect()`, Sails sends a response with status code [302](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection), indicating a temporary redirect.  This instructs the user agent to send a new request to the indicated URL.  There is no way to _force_ a user agent to follow redirects, but most clients play nicely.
> + In general, you should not need to use `res.redirect()` if a request "wants JSON" (i.e. [`req.wantsJSON`](https://sailsjs.com/documentation/reference/request-req/req-wants-json)).
> + If a request originated from the Sails socket client, it always "wants JSON", so the [Sails socket client](https://sailsjs.com/documentation/reference/web-sockets/socket-client) does _not_ follow redirects. For this reason, if an action is called via a WebSocket request using (for example) [`io.socket.get()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-get), it will simply receive the appropriate status code and a "Location" header indicating the location of the desired resource.  It&rsquo;s up to the client-side code to decide how to handle redirects for WebSocket requests.



<docmeta name="displayName" value="res.redirect()">
<docmeta name="pageType" value="method">

