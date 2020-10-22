# `req.setTimeout()`

Time out this request if a response is not sent within the specified number of milliseconds.

### Usage
```usage
req.setTimeout(numMilliseconds);
```


### Example

To cause requests to a particular action to time out after 4 minutes:
```js
req.setTimeout(240000);
```

### Notes

+ By default, normal HTTP requests to Node.js/Express/Sails.js apps time out [after 2 minutes](https://nodejs.org/dist/latest/docs/api/http.html#http_server_settimeout_msecs_callback) (120000 milliseconds) if a response is not sent.

<docmeta name="displayName" value="req.setTimeout()">
<docmeta name="pageType" value="method">
