# `io.socket.get()`

Send a socket request (virtual GET) to a Sails server using Socket.IO.

```js
io.socket.get(url, data, function (resData, jwres){
  // ...
});
```

### Usage


|   | Argument   | Type         | Details |
|---|:-----------|:------------:|:--------|
| 1 | url        | ((string))   | The destination URL path, e.g. "/checkout".
| 2 | _data_     | ((json?))        | Optional request data. If provided, it will be URL-encoded and appended to `url` (existing query string params in url will be preserved).
| 3 | _callback_ | ((function?)) | Optional callback. If provided, it will be called when the server responds.

##### Callback

|   | Argument  | Type            | Details |
|---|:----------|:---------------:|:--------|
| 1 | resData   | ((json))        | Data, if any, sent in the response from the Sails server.  This is the same thing as `jwres.body`.
| 2 | jwres     | ((dictionary))  | A JSON WebSocket response, which consists of `headers` (a ((dictionary))), `body` (((json))), and `statusCode` (a ((number))).



### Example

```html
<script>
io.socket.get('/users/9', function (resData) {
  // resData => {id:9, name: 'Timmy Mendez'}
});
</script>
```

### Notes
> + Remember that you can communicate with _any of your routes_ using socket requests.
> + Need to customize request headers?  Check out the slightly lower-level [`io.socket.request()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-request) method. To set custom headers for _all_ outgoing requests, check out [`io.sails.headers`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails).

<docmeta name="displayName" value="io.socket.get()">
<docmeta name="pageType" value="method">

