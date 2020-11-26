# res.notFound()

This method is used to send a <a href="http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#4xx_Client_Error" target="_blank">404</a> ("Not Found") response using either [res.json()](https://sailsjs.com/documentation/reference/response-res/res-json) or [res.view()](https://sailsjs.com/documentation/reference/response-res/res-view). It is called automatically when Sails receives a request that doesn't match any of its explicit routes or route blueprints (i.e. serves the 404 page).

When called manually from your app code, this method is normally used to indicate that the user agent tried to find, update, or delete something that doesn't exist.


### Usage

```usage
return res.notFound();
```

### Details

Like the other built-in custom response modules, the behavior of this method is customizable.

By default, it works as follows:

+ The status code of the response will be set to 404.
+ If the request "[wants JSON](https://sailsjs.com/documentation/reference/request-req/req-wants-json)" (e.g. the request originated from AJAX, WebSockets, or a REST client like cURL), Sails will send a response body with the string `"Not Found"`.
+ If the request _does not_ "want JSON" (e.g. a URL typed into a web browser), Sails will attempt to serve the view located at `views/404.ejs` (assuming the default EJS [view engine](https://sailsjs.com/documentation/concepts/views/view-engines)).  If no such view is found, or an error occurs attempting to serve it, a default response body will be sent with the string `"Not Found"`.

### Example

```javascript
Pet.findOne()
.where({ name: 'fido' })
.exec(function(err, fido) {
  if (err) return res.serverError(err);
  if (!fido) return res.notFound();
  // ...
})
```


### Notes
> + This method is **terminal**, meaning that it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).
>+ `res.notFound()` (like other userland response methods) can be overridden or modified.  It runs the response method defined in `api/responses/notFound.js`.  If a `notFound.js` response method does not exist in your app, Sails will use the default behavior.










<docmeta name="displayName" value="res.notFound()">
<docmeta name="pageType" value="method">

