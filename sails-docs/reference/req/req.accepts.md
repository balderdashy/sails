# `req.accepts()`

Return whether this request (`req`) advertises that it understands the specified media type.

> If none of the media types are considered acceptable, this returns `false`.  Otherwise, it returns truthy (the media type).

### Usage
```usage
req.accepts(mediaType);
```

### Example

If a request is sent with an `"Accept: application/json"` header:

```javascript
req.accepts('application/json');
// -> 'application/json'

req.accepts('json');
// -> 'json'

req.accepts('image/png');
// -> false
```

If a request is sent with an `"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"` header:

```javascript
req.accepts('html');
// -> 'html'

req.accepts('text/html');
// -> 'text/html'

req.accepts('json');
// -> false
```

### Notes

> + The specified media type may be provided as either a [MIME type string](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) such as "application/json", or an extension name such as "json".
> + This is implemented by examining the request's ["Accept" header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept).
> + See the [`accepts` package](https://www.npmjs.com/package/accepts) for the finer details of the header-parsing algorithm used in Sails/Express.

<docmeta name="displayName" value="req.accepts()">
<docmeta name="pageType" value="method">

