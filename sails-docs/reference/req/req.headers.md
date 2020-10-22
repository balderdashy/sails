# `req.headers`

An object containing the predefined/custom header given in the current request.

### Usage

```usage
req.headers;
```

### Details

Often we want to check the headers of the current request. This can be done easily in Sails.

### Example

Sample output of the `req.headers` object:

```javascript
console.log(req.headers);

{ host: 'localhost:1337',
  connection: 'keep-alive',
  'cache-control': 'no-cache',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36',
  accept: '*/*',
  'accept-encoding': 'gzip, deflate, sdch',
  'accept-language': 'en-US,en;q=0.8,hi;q=0.6',
  cookie: 'sdfkslddklfk; sails.sid=s%3skdlfjkj1231lsdfnsc,m' }
```


### Note

If you want to access any specific, custom, or predefined header, it can be done with bracket notation:

```javascript
req.headers['custom-header'];
```

or dot notation:

```javascript
req.headers.host;
```
<docmeta name="displayName" value="req.headers">
<docmeta name="pageType" value="property">
