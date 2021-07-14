# `req.body`

An object containing text parameters from the parsed request body, defaulting to `{}`.

By default, the request body can be URL-encoded or stringified as JSON.  Support for other formats, such as serialized XML, is possible using the [middleware](https://sailsjs.com/documentation/concepts/Middleware) configuration.

### Usage
```usage
req.body;
```

### Notes
>+ If a request contains one or more file uploads, only the text parameters sent _**before**_ the first file parameter will be available in `req.body`.
>+ When using [Skipper](https://github.com/balderdashy/skipper), the default body parser, this property will be `undefined` for GET requests.



<docmeta name="displayName" value="req.body">
<docmeta name="pageType" value="property">

