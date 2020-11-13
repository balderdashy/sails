# `req.acceptsLanguages()`

Return whether this request (`req`) advertises that it understands any of the specified language(s), and if so, which one.

> If _more than one_ of the languages passed in to this method are considered acceptable, then the first one will be returned.  If none of the languages are considered acceptable, this returns `false`.
> (By languages, we mean natural languages, like English or Japanese, not programming languages.)


### Usage

```usage
req.acceptsLanguages(language);
```

_Or:_
+ `req.acceptsLanguages(language1, language2, …);`


### Details

This method can be useful as a complement to built-in [internationalization and localization](https://sailsjs.com/documentation/concepts/Internationalization), which allows for automatically serving different content to different locales based on the request.


### Example

If a request is sent with `"Accept-Language: da, en, en-gb, en-us;"`:

```js
req.acceptsLanguages('en');
// -> 'en'

req.acceptsLanguages('es');
// -> false

req.acceptsLanguages('en-us', 'en', 'en-gb');
// -> 'en-us'

req.acceptsLanguages('en-gb', 'en', 'en-us');
// -> 'en-gb'

req.acceptsLanguages('es', 'fr');
// -> false
```


### Notes

> + You can expect the ["Accept-Language" header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language) to exist in most requests that originate in web browsers (see [RFC-2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4)).
> + Browsers send the "Accept-Language" header automatically, based on the user's language settings.
> + See the [`accepts` package](https://www.npmjs.com/package/accepts) for the finer details of the header-parsing algorithm used in Sails/Express.



<docmeta name="displayName" value="req.acceptsLanguages()">
<docmeta name="pageType" value="method">

