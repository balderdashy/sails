# `io.socket.request()`

Send a virtual request to a Sails server using Socket.IO.

This function is very similar to [`io.socket.get()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-get), [`io.socket.post()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-post), etc. except that it provides lower-level access to the request headers, parameters, method, and URL of the request.

Using the automatically-created [`io.socket`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket) instance:

```js
io.socket.request(options, function (resData, jwres)){
  // ...
  // jwres.headers
  // jwres.statusCode
  // jwres.body === resData
  // ...
});
```


### Usage


| Option   | Type         | Details |
|:-----------|:------------:|:--------|
| method    | ((string))   | The HTTP request method; e.g. `'GET'`.
| url       | ((string))   | The destination URL path; e.g. "/checkout".
| _data_    | ((json?))    | Optional. If provided, this request data will be JSON-encoded and included as the virtual HTTP body.
| _headers_ | ((dictionary?))   | Optional. If provided, this dictionary of string headers will be sent as virtual request headers.


##### Callback

|   | Argument  | Type         | Details |
|---|:----------|:------------:|:--------|
| 1 | `resData` | ((json))     | Data received in the response from the Sails server (=== `jwres.body`, and also equivalent to the HTTP response body).
| 2 | `jwres`   | ((dictionary))      | A JSON WebSocket Response object.  Has `headers`, a `body`, and a `statusCode`.





### Example

```javascript
io.socket.request({
  method: 'get',
  url: '/user/3/friends',
  data: {
    limit: 15
  },
  headers: {
    'x-csrf-token': 'ji4brixbiub3'
  }
}, function (resData, jwres) {
  if (jwres.error) {
    console.log(jwres.statusCode); // => e.g. 403
    return;
  }

  console.log(jwres.statusCode); // => e.g. 200

});
```



### Notes
> + A helpful analogy might be to think of the difference between `io.socket.get` and this method as the difference between JQuery's `$.get` and `$.ajax`.
> + Remember that you can communicate with _any of your routes_ using socket requests.
> + Need to set custom headers for _all_ outgoing requests?  Check out [`io.sails.headers`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails).

<docmeta name="displayName" value="io.socket.request()">
<docmeta name="pageType" value="method">
