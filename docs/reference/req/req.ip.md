# `req.ip`

The IP address of the client who sent this request (`req`).

> **Note:**
>
> If your Sails app is deployed behind a proxy (on Heroku, for example), then you'll need to do a bit of additional configuration.  Normally, `req.ip` is simply the "remote address"&mdash;the IP address of the requesting user agent.  But if the [sails.config.http.trustProxy](https://sailsjs.com/documentation/reference/configuration/sails-config-http) option is enabled, this is the "[upstream address](https://en.wikipedia.org/wiki/X-Forwarded-For)".

### Usage
```usage
req.ip;
```

### Example
```javascript
req.ip;
// -> "127.0.0.1"
```



<docmeta name="displayName" value="req.ip">
<docmeta name="pageType" value="property">
