# `req.ips`

If [sails.config.http.trustProxy](https://sailsjs.com/documentation/reference/configuration/sails-config-http) is enabled, this variable contains the IP addresses in this request's "X-Forwarded-For" header as an array of the IP address strings. Otherwise an empty array is returned.

### Usage
```usage
req.ips;
```

### Example
If a request contains a header, "X-Forwarded-For: client, proxy1, proxy2":

```js
req.ips;
// -> ["client", "proxy1", "proxy2"]`

// ("proxy2" is the furthest "down-stream" IP address)
```










<docmeta name="displayName" value="req.ips">
<docmeta name="pageType" value="property">
