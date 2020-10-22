# Locales

### Overview

The i18n hook reads JSON-formatted translation files from your project's "locales" directory (`config/locales` by default).  Each file corresponds with a [locale](http://en.wikipedia.org/wiki/Locale) (usually a language) that your Sails backend will support.

These files contain locale-specific strings (as JSON key-value pairs) that you can use in your views, controllers, etc.  The name of the file should match the language that you are supporting. This allows for automatic language detection based on request headers.

Here is an example locale file (`config/locales/es.json`):
```json
{
    "Hello!": "Hola!",
    "Hello %s, how are you today?": "¿Hola %s, como estas?"
}
```

Locales can be accessed in controller actions and policies through `req.i18n()`, or in views through the `__(key)` or `i18n(key)` functions.

```ejs
<h1> <%= __('Welcome to PencilPals!') %> </h1>
<h2> <%= i18n('Hello %s, how are you today?', 'Pencil Maven') %> </h2>
<p> <%= i18n('That\'s right-- you can use either i18n() or __()') %> </p>
```

Note that the keys in your stringfiles (e.g. "Hello %s, how are you today?") are **case sensitive** and require exact matches.  There are a few different schools of thought on the best approach here; it really depends on who is editing the stringfiles and how often.  Especially if you'll be editing the translations by hand, simpler, all-lowercase key names may be preferable for maintainability.

For example, here's another way you could approach `config/locales/es.json`:

```json
{
    "hello": "hola",
    "howAreYouToday": "cómo estás"
}
```

And here's `config/locales/en.json`:

```json
{
    "hello": "hello",
    "howAreYouToday": "how are you today"
}
```

To represent nested strings, use `.` in keys.  For example, here are some of the strings for an app's "Edit profile" page:

``` json
{
  "editProfile.heading": "Edit your profile",
  "editProfile.username.label": "Username",
  "editProfile.username.description": "Choose a new unique username.",
  "editProfile.username.placeholder": "callmethep4rtysquid"
}
```


### Detecting and/or overriding the desired locale for a request

To determine the current locale used by the request, use [`req.getLocale()`](https://github.com/jeresig/i18n-node-2/tree/9c77e01a772bfa0b86fab8716619860098d90d6f#getlocale).

To override the auto-detected language/localization preference for a request, use [`req.setLocale()`](https://sailsjs.com/documentation/reference/request-req/req-set-locale), calling it with the unique code for the new locale, e.g.:

```js
// Force the language to German for the remainder of the request:
req.setLocale('de');
// (this will use the strings located in `config/locales/de.json` for translation)
```

By default, node-i18n will detect the desired language of a request by examining its language headers.  Language headers are set in your users' browser settings, and while they're correct most of the time, you may need the flexibility to override this detected locale and provide your own.  For a deeper dive into one way you might go about implementing this, check out [this gist](https://gist.github.com/mikermcneil/0af155ed546f3ddf164b4885fb67830c).


<docmeta name="displayName" value="Locales">
