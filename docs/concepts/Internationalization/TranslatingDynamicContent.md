### Translating dynamic content

If your backend is storing interlingual data (e.g. product data is entered in multiple languages via a CMS), you shouldn't rely on simple JSON locale files unless you're somehow planning on editing your locale translations dynamically.  One option is to edit the locale translations programatically, either with a custom implementation or through a translation service.  Sails/node-i18n JSON stringfiles are compatible with the format used by [webtranslateit.com](https://webtranslateit.com/en).

On the other hand, you might opt to store these types of dynamic translated strings in a database.  If so, just make sure to build your data model accordingly so you can store and retrieve the relevant dynamic data by locale id (e.g. "en", "es", "de", etc.).  That way, you can leverage the [`req.getLocale()`](https://github.com/jeresig/i18n-node-2/tree/9c77e01a772bfa0b86fab8716619860098d90d6f#getlocale) method to help you figure out which translated content to use in any given response, and keep consistent with the conventions used elsewhere in your app.
<docmeta name="displayName" value="Translating dynamic content">
