# `sails.config.i18n`

Configuration for Sails' built-in internationalization and localization features.  By convention, this is set in `config/i18n.js`, from which you can set your supported locales. For more information see the [concepts section on internationalization](https://sailsjs.com/documentation/concepts/Internationalization).


### Properties

| Property           | Type        | Default               | Details |
|:-------------------|:-----------:|:----------------------|:--------|
| `locales`          | ((array))   | `['en','es','fr','de']` | List of supported [locale codes](http://en.wikipedia.org/wiki/BCP_47). Note that these values and the name of their corresponding translation files must be lowercase.
| `localesDirectory` | ((string))  | `'config/locales'`     | The app-relative path to the folder containing your locale translations (i.e. stringfiles).  Alternatively, an absolute path maybe provided.
| `defaultLocale`    | ((string))  | `'en'`                  | The default locale for the site. Note that this setting will be overridden for any request that sends an "Accept-Language" header (i.e. most browsers), but it's still useful if you need to localize the response for requests made by non-browser clients (e.g. mobile devices, IoT, cURL, Postman, etc.).




<docmeta name="displayName" value="sails.config.i18n">
<docmeta name="pageType" value="property">

