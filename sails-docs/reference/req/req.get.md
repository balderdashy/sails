# `req.get()`

Returns the value of the specified `header` field in this request (`req`).  Note that header names are case-_insensitive_.

### Usage

```usage
req.get(header);
```

### Example
Assuming `req` contains a header named 'myField' with value 'cat':

```javascript
req.get('myField');
// -> cat
```

### Notes
>+ The `header` argument is case-insensitive.
>+ The `header` argument treats both "referrer" and "referer" as synonyms, because sp3ll1n9.






<docmeta name="displayName" value="req.get()">
<docmeta name="pageType" value="method">
