# HTTP Strict Transport Security

Strict Transport Security (STS) is an opt-in security enhancement that forces usage of `HTTPS` instead of `HTTP` (in modern browsers, at least).

### Enabling STS

Implementing STS is actually very simple and [only takes a few lines of code](https://github.com/krakenjs/lusca/blob/master/lib/hsts.js).  Better yet, a few different open-source modules exist that bring support for this feature to Express and Sails.  To use one of these modules, install it from npm using the directions below, then open `config/http.js` in your project and [configure it as a custom middleware](https://sailsjs.com/documentation/concepts/Middleware).  The example below covers basic usage and configuration.  For more guidance and advanced usage details, be sure and follow the link to the docs.


##### Using [lusca](https://github.com/krakenjs/lusca#luscahstsoptions)

> `lusca` is open-source under the [Apache license](https://github.com/krakenjs/lusca/blob/master/LICENSE.txt)


```sh
# In your sails app
npm install lusca --save
```

Then in the `middleware` config object in `config/http.js`:

```js
  // ...
  // maxAge ==> Number of seconds strict transport security will stay in effect.
  strictTransportSecurity: require('lusca').hsts({ maxAge: 31536000 })
  // ...
```



### Additional Resources
+ [HTTP Strict Transport Security (OWasp)](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security)



<docmeta name="displayName" value="Strict Transport Security">
