# sails.request()

> ##### _**This feature is still experimental.**_
> This method is still under development, and its interface and/or behavior could change at any time.

Make a virtual request to a running Sails instance.

```usage
sails.request(request);
```

_Or:_

+ `sails.request(url, body)`
+ `sails.request(url, callback)`
+ `sails.request(url, body, callback)`

This method can be used on instances that have been started with [`sails.load()`](https://sailsjs.com/documentation/reference/application/sails-load) and that are not actively listening for HTTP requests on a server port.  This makes `sails.request()` useful for testing scenarios where running [`sails.lift()`](https://sailsjs.com/documentation/reference/application/sails-lift) is not necessary.  However, it should be noted that the data may not be processed in exactly the same way as an HTTP request; in particular, a much simpler body parser will be employed, and Express middleware such as the static asset server will not be used.


### Usage

|   |       Argument             | Type                | Details
|---|--------------------------- | ------------------- |:-----------:
| 1 |      request (or url)      | ((string)) -or- ((dictionary))          | The virtual request to make.  If specified as a string, this should be an address containing an optional method and a path, e.g. `/foo` or `PUT /user/friend`.  If specified as an object, it should have one or more of the properties described in the "request argument" section below.
| 2 |      _body_                  | ((json?)) | (optional) A JSON-serializable value to use as the request body.  This argument will override the `data` property of the `request` argument, if provided.
| 3 |      _callback_              | ((function?)) | (optional) A callback to be called with the virtual response.

#### Request object

If the `request` argument is specified as an object, it can have the following properties:

|       Property             | Type                | Example | Details
|--------------------------- | ------------------- | ------- | :-----------:
| url                        | ((string))          | `"/foo"`, `"PUT /user/friend"`    | (required) The route in the Sails app to make a request to, with an optional HTTP method prefix
| method                     | ((string))          | `"GET"`, `"POST"`    | (optional) The HTTP method to use in the request.  This will override any method supplied as part of the `url` property.
| headers                    | ((dictionary))          | `{'content-type': 'application/json'}`    | (optional) Dictionary of headers to use in the virtual request.
| data                       | ((json))            | `{foo:'bar'}`, `12345` | ((optional)) Data to send along with the request.  For `GET`, `HEAD` and `DELETE` requests, the data will be serialized into a querystring and added to the URL.  Otherwise, it will be sent as-is as the request body.

#### Callback

|   |       Argument             | Type                | Details
|---|--------------------------- | ------------------- |:-----------
| 1 |       _err_                | ((Error?))           | If the response was unsuccessful (status code was not in the 200-399 range) this will be an object containing `status` and `body` properties.  If the response was successful, this will be `null`.
| 2 |       response             | ((dictionary))          | If the response was successful, this will be an object containing the full server response.
| 3 |       body                 | ((json))            | If the response was successful, this will be the value of `response.body`.


#### Returns

**Type:** ((stream))

The full virtual request stream object.  This is a readable stream.

<docmeta name="displayName" value="sails.request()">
<docmeta name="pageType" value="method">
<docmeta name="isExperimental" value="true">
