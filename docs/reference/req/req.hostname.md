# `req.hostname`

Returns the hostname supplied in the host HTTP header. This header may be set either by the client or by the proxy.

### Usage

```usage
req.hostname;
```

### Example

If this request's "Host" header was "ww3.staging.ibm.com:1492":

```javascript
req.hostname;
// -> "ww3.staging.ibm.com"
```









<docmeta name="displayName" value="req.hostname">
<docmeta name="pageType" value="property">
