# `res.cookie()`

Sets a cookie with name (`name`) and value (`value`) to be sent along with the response.


### Usage
```usage
res.cookie(name, value [,options]);
```


### Details

The `path` option defaults to "/".

`maxAge` is a convenience option that sets `expires` relative to the current time in milliseconds. 

```javascript
res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true });
```

An object that is passed is then serialized as JSON, which is automatically parsed by the Express body-parser middleware.

```javascript
res.cookie('cart', { items: [1,2,3] });
res.cookie('cart', { items: [1,2,3] }, { maxAge: 900000 });
```

Signed cookies are also supported through this method&mdash;just pass the `signed` option, set to `true`. `res.cookie()` will then use the secret passed into `express.cookieParser(secret)` to sign the value.

```javascript
res.cookie('name', 'tobi', { signed: true });
```


### Example
```javascript
res.cookie('name', 'tobi', {
  domain: '.example.com',
  path: '/admin',
  secure: true
});

res.cookie('rememberme', '1', {
  expires: new Date(Date.now() + 900000),
  httpOnly: true
});
```





<docmeta name="displayName" value="res.cookie()">
<docmeta name="pageType" value="method">
