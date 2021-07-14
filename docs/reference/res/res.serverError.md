# `res.serverError()`

This method is used to send a <a href="http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#5xx_Server_Error" target="_blank">500</a> ("Server Error") response back down to the client, indicating that some kind of server error occurred (i.e. the error is not the requesting user agent's fault).

### Usage


```usage
return res.serverError(err);
```

_Or:_
+ `return res.serverError();`

### Details

Like the other built-in custom response modules, the behavior of this method is customizable.

By default, it works as follows:

+ The status code of the response will be set to 500.

+ If the request "[wants JSON](https://sailsjs.com/documentation/reference/request-req/req-wants-json)" (e.g. the request originated from AJAX, WebSockets, or a REST client like cURL), Sails will send the provided error `data` as JSON.  If no `data` is provided, a default response body will be sent (the string `"Internal Server Error"`).

+ If the request _does not_ "want JSON" (e.g. a URL typed into a web browser), Sails will attempt to serve the view located at `views/500.ejs` (assuming the default EJS [view engine](https://sailsjs.com/documentation/concepts/views/view-engines)).  If no such view is found, or an error occurs attempting to serve it, a default response body will be sent with the string `"Internal Server Error"`.



### Example

```javascript
return res.serverError('Salesforce could not be reached');
```

### Notes
> + This method is **terminal**, meaning that it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).

>+ `res.serverError()` (like other userland response methods) can be overridden or modified.  It runs the response method defined in `api/responses/serverError.js`.  If a `serverError.js` response method does not exist in your app, Sails will use the default behavior.

>+ The specified `data` **will be excluded from the JSON response and view locals** if the app is running in the "production" environment (i.e. `process.env.NODE_ENV === 'production'`).




<docmeta name="displayName" value="res.serverError()">
<docmeta name="pageType" value="method">

