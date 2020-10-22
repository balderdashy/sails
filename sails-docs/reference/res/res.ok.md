# `res.ok()`

This method is used to send a <a href="https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_Success" target="_blank">200</a> ("OK") response back down to the client.


### Usage

```usage
return res.ok();
```

_Or:_
+ `return res.ok(data);`


### Details

Like the other built-in custom response modules, the behavior of this method is customizable.

By default, it works as follows:

+ The status code of the response will be set to 200.
+ Sails will send any provided error `data` as JSON.  If no `data` is provided, a default response body will be sent (the string `"OK"`).


### Example

```javascript
return res.ok();
```


### Notes
> + This method is **terminal**, meaning that it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).
>+ `res.ok()` (like other userland response methods) can be overridden or modified.  It runs the response method defined in `api/responses/ok.js`.  If an `ok.js` response method does not exist in your app, Sails will use the default behavior.







<docmeta name="displayName" value="res.ok()">
<docmeta name="pageType" value="method">

