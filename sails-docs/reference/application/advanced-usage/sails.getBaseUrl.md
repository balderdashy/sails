# sails.getBaseUrl()

> ##### _**This method is deprecated and will likely be removed or changed in an upcoming release.**_
> There is no reliable, cross-platform way to automatically detect the external URL of a running Sails app (or any other Node app).  Instead, configure your base URL explicitly and save it in [custom configuration](https://sailsjs.com/documentation/reference/configuration/sails-config-custom) (e.g. `sails.config.custom.baseUrl`) that you can reference throughout the app.  (This can then be overridden in production, staging, etc. as needed using [environment-dependent configuration](https://sailsjs.com/documentation/concepts/configuration#?environmentspecific-files-config-env).)

Return a (possibly incorrect) best guess of the base URL for this app, based on a combination of user-supplied and default configuration values.


```usage
sails.getBaseUrl();
```

`getBaseUrl()` constructs a URL string by inspecting various configuration values and defaults.  For example, if `sails.config.ssl.key` and `sails.config.ssl.cert` both have values, the URL will start with `https://` instead of `http://`.  If `sails.config.explicitHost` is not undefined, its value will be used as the domain name, otherwise it will be `localhost`.  If `sails.config.port` is not 80 or 443, its value will be appended to the URL as well.


### Usage

_This function does not accept any arguments._


#### Returns

**Type:** ((string))

```javascript
http://localhost:1337
```



### Example

In an email template...
```html
For more information, visit <a href="<%=sails.getBaseUrl()%>">our web site</a>.
```

<docmeta name="displayName" value="sails.getBaseUrl()">
<docmeta name="pageType" value="method">
<docmeta name="isDeprecated" value="true">
