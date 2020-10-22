# `req.acceptsCharsets()`

Return whether this request (`req`) advertises that it is able to handle any of the specified character set(s), and if so, which one.

> If _more than one_ of the character sets passed in to this method are considered acceptable, then the first one will be returned.  If none of the character sets are considered acceptable, this returns `false`.

### Usage

```usage
req.acceptsCharsets(charset);
```

or:
+ `req.acceptsCharsets(charset1, charset2, …);`

### Details

Useful for advanced content negotiation where a client may or may not support certain character sets, such as Unicode (UTF-8).


### Example

If a request is sent with a `"Accept-Charset: utf-8"` header:

```js
req.acceptsCharsets('utf-8');
// -> 'utf-8'

req.acceptsCharsets('iso-8859-1', 'utf-16', 'utf-8');
// -> 'utf-8'

req.acceptsCharsets('utf-16');
// -> false
```

### Notes
> + This is implemented by examining the request's [`Accept-Charset`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset) header (see [RFC-2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.2)).
> + See the [`accepts` module](https://www.npmjs.com/package/accepts) for the finer details of the header-parsing algorithm used in Sails/Express.





<docmeta name="displayName" value="req.acceptsCharsets()">
<docmeta name="pageType" value="method">
