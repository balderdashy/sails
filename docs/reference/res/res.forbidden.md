# `res.forbidden()`

This method is used to send a <a href="http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_Error" target="_blank">403</a> ("Forbidden") response back down to the client, indicating that a request is not allowed.  This usually means the user agent tried to do something it was not allowed to do, like change the password of another user.


### Usage

```usage
return res.forbidden();
```

### Details

Like the other built-in custom response modules, the behavior of this method is customizable.

By default, it works as follows:

+ The status code of the response is set to 403.
+ A response body is sent with the string `"Forbidden"`.

### Example

```javascript
if ( !req.session.userId ) {
  return res.forbidden();
}
```


### Notes
> + This method is **terminal**, meaning that it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).
>+ `res.forbidden()` (like other userland response methods) can be overridden or modified.  It runs the response method defined in `api/responses/forbidden.js`.  If a `forbidden.js` response method does not exist in your app, Sails will use the default behavior.




<docmeta name="displayName" value="res.forbidden()">
<docmeta name="pageType" value="method">

