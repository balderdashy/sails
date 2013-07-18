# Translation (i18n)
> _Note: You are viewing the Sails.js v0.9.0 documentation.  If you're looking for information on v0.8.x, please visit [here](http://08x.sailsjs.org)._

## Locale
All locale files live under `config/locales`. Here is where you can add locale data as JSON key-value pairs. The name of the file should match the language that you are supporting, which allows for automatic language detection based on the user request.
Here is an example locale file (`config/locales/es.json`):  
```json
{
    "Hello!": "Hola!",
    "Hello %s, how are you today?": "¿Hola %s, como estas?",
}
```
## Usage
Locales can be accessed through either `res.i18n()`, or in views through the `i18n()` function.
Remember that the keys are case sensitive and require exact key matches.
e.g.:
```ejs
<h1> <%= i18n('Hello!') %> </h1>
<h1> <%= i18n('Hello %s, how are you today?', 'Mike') %> </h1>
```

## config
Locale config can be found in `config/i18n.js`, from which you can set your supported locales:
```javascript
// Which locales are supported?
locales: ['en', 'es'],

// Where are your locale translations located?
localesDirectory: '/config/locales'
```
