# `res.jsonp()`

Send a JSON or JSONP response.

Identical to [`res.json()`](https://sailsjs.com/documentation/reference/response-res/res-json) except that, if a request parameter named "callback" was provided in the query string, then Sails will send the response data as [JSONP](http://en.wikipedia.org/wiki/JSONP) instead of JSON.  The value of the "callback" request parameter will be used as the name of the JSONP function call wrapper in the response.

### Usage
```usage
return res.jsonp(data);
```

### Example

In an action:

```js
return res.jsonp([
  {
    name: 'Thelma',
    id: 1
  }, {
    name: 'Leonardo'
    id: 2
  }
]);
```


Given `?callback=gotStuff`, the code above would send back a response body like:

```javascript
gotStuff([{name: 'Thelma', id: 1}, {name: 'Louise', id: 2}])
```



### Notes
> + Don't forget that this method's name is all lowercase.
> + If no "callback" request parameter was provided, this method works exactly like `res.json()`.
> + This method is **terminal**, meaning that it is generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).






<docmeta name="displayName" value="res.jsonp()">
<docmeta name="pageType" value="method">

