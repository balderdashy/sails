# `res.clearCookie()`

Clears cookie (`name`) in the response.

### Usage

```usage
res.clearCookie(name [,options]);
```

### Details

The path option defaults to "/".


### Example
```javascript
res.cookie('name', 'tobi', { path: '/admin' });
res.clearCookie('name', { path: '/admin' });
```








<docmeta name="displayName" value="res.clearCookie()">
<docmeta name="pageType" value="method">
