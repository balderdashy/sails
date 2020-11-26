# `req.xhr`

A flag indicating whether the current request (`req`) appears to be an AJAX request (i.e. it was issued with its "X-Requested-With" header set to "XMLHttpRequest").


### Usage
```usage
req.xhr;
```

### Example
```javascript
if (req.xhr) {
  // Yup, it's AJAX alright.
}
```


### Notes
> + Whenever possible, you should prefer the `req.wantsJSON` flag.  Avoid writing custom content negotiation logic into your app, as it makes your code more brittle and verbose.






<docmeta name="displayName" value="req.xhr">
<docmeta name="pageType" value="property">
