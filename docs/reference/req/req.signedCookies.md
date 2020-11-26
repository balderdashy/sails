# `req.signedCookies`

A dictionary containing all the signed cookies from the request object, where a signed cookie is one that is protected against modification by the client. This protection is provided by a Base64-encoded HMAC of the cookie value. When retrieving the cookie, if the HMAC signature does not match based on the cookie's value, then the cookie is not available as a member of the `req.signedCookies` object.

### Purpose
A dictionary containing all of the signed cookies from this request (`req`).


### Usage
```usage
req.signedCookies;
```



### Example
Adding a signed cookie named "chocolatechip" with value "Yummy:

```javascript
res.cookie('chocolatechip', 'Yummy', {signed:true});
```

Retrieving the cookie:
```javascript
req.signedCookies.chocolatechip;
// "Yummy"
```






<docmeta name="displayName" value="req.signedCookies">
<docmeta name="pageType" value="property">
