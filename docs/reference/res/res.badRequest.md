# `res.badRequest()`

This method is used to send a <a href="http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_Error" target="_blank">400</a> ("Bad Request") response back down to the client, indicating that the request is invalid.  This usually means that the request contained invalid parameters or headers, or that it tried to do something not supported by your app logic.



### Usage

```usage
return res.badRequest();
```

_Or:_
+ `return res.badRequest(data);`



### Details

Like the other built-in custom response modules, the behavior of this method is customizable.

By default, it works as follows:

+ The status code of the response is set to 400.
+ Sails sends any provided error `data` as JSON.  If no `data` is provided, a default response body will be sent (the string `"Bad Request"`).


### Example

```javascript
if ( req.param('amount') > 123 )
  return res.badRequest(
    'Transaction limit exceeded. Please try again with an amount less than $123.'
  );
}
```
### Notes
> + This method is **terminal**, meaning it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).
>+ `res.badRequest()` (like other userland response methods) can be overridden or modified.  It runs the response method defined in `api/responses/badRequest.js`.  If a `badRequest.js` response method does not exist in your app, Sails will implicitly use the default behavior.
>+ This method is called automatically by the [Blueprint Actions](https://sailsjs.com/documentation/concepts/blueprints/blueprint-actions) when bad parameters are sent with a request.













<docmeta name="displayName" value="res.badRequest()">
<docmeta name="pageType" value="method">

