# `req.setLocale()`

Override the inferred locale for this request.

Normally, the locale is determined on a per-request basis based on incoming request headers (i.e. a user's browser or device language settings).  This command overrides that setting for a particular request.

### Usage
```usage
req.setLocale(override);
```


### Example

To allow users to specify their own language settings:
```js
if (this.req.me.preferredLocale) {
  this.req.setLocale(this.req.me.preferredLocale);
}
return exits.success();
```

Or, if you are not using the "Web app" template and/or actions2:
```js
var me = await User.findOne({ id: req.session.userId });
if (me.preferredLocale) {
  req.setLocale(me.preferredLocale);
}
return res.view('pages/homepage');
```


<docmeta name="displayName" value="req.setLocale()">
<docmeta name="pageType" value="method">
