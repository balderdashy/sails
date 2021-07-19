# `io.socket.delete()`

Send a virtual DELETE request to a Sails server using Socket.IO.

```js
io.socket.delete(url, data, function (data, jwres){
  // ...
});
```


### Usage

|   | Argument   | Type         | Details |
|---|------------|:------------:|---------|
| 1 | url        | ((string))   | The destination URL path, e.g. "/checkout".
| 2 | _data_     | ((json?))    | Optional request data. If provided, it will be URL-encoded and appended to `url` (existing query string params in url will be preserved).
| 3 | _callback_ | ((function?)) | Optional callback. If provided, it will be called when the server responds.

##### Callback

|   | Argument  | Type         | Details |
|---|-----------|:------------:|---------|
| 1 | resData   | ((json))        | Data received in the response from the Sails server (=== `jwres.body`, equivalent to the HTTP response body).
| 2 | jwres     | ((dictionary))      | A JSON WebSocket Response object.  Has `headers`, a `body`, and a `statusCode`.


### Example

```html
<script>
io.socket.delete('/users/9', function (resData) {
  resData; // => {id:9, name: 'Timmy Mendez', occupation: 'psychic'}
});
</script>
```


### Notes
> + Remember that you can communicate with _any of your routes_ using socket requests.
> + Need to customize request headers?  Check out the slightly lower-level [`io.socket.request()`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-socket-request) method. To set custom headers for _all_ outgoing requests, check out [`io.sails.headers`](https://sailsjs.com/documentation/reference/web-sockets/socket-client/io-sails).


<docmeta name="displayName" value="io.socket.delete()">
<docmeta name="pageType" value="method">
