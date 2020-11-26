# `sails.config.log`

Configuration for the [logger](https://sailsjs.com/documentation/concepts/logging) in your Sails app.  These settings apply whenever you call functions like `sails.log.debug()` or `sails.log.error()` in your app code, as well as when Sails logs a message to the console automatically.  The options here are conventionally specified in the [config/log.js](https://sailsjs.com/documentation/anatomy/config/log.js) configuration file.


### Properties

| Property  | Type        | Default     | Details                                                                             |
|:----------|-------------|:------------|:------------------------------------------------------------------------------------|
| level   | ((string))  | `'info'`    | Set the level of detail to be shown in your app's log.
| inspect | ((boolean)) | `true`      | Set to false to disable captain's log's handling of logging, logs will instead be passed to the configured custom logger.  |
| custom  | ((ref))     | `undefined` | Specify a reference to an instance of a custom logger (such as [Winston](https://github.com/winstonjs/winston)).  If provided, instead of logging directly to the console, the functions exposed by the custom logger will be called, and log messages from Sails will be passed through.  For more information, see [captains-log](https://github.com/balderdashy/captains-log/blob/master/README.md#why-use-a-custom-logger).

### Using a custom logger

It is sometimes useful to configure a custom logger, particularly for regulatory compliance and organizational requirements (e.g. if your company is using a particular logger in other apps).  In the context of Sails, configuring a custom logger also allows you to intercept all log messages automatically created by the framework, which is handy for setting up email notifications about errors and warnings.

> Don't feel like you _have_ to use a custom logger if you want these sorts of notifications!  In fact, there are usually more straightforward ways to implement features like automated Slack, SMS, or email notifications when errors occur.  One approach is to customize your app's default server error response ([`responses/serverError.js`](https://sailsjs.com/documentation/anatomy/my-app/api/responses/server-error-js)).  Another popular option is to use a product like [Papertrail](https://papertrailapp.com/), or a monitoring service like [AppDynamics](https://www.appdynamics.com/nodejs/sails/) or [NewRelic](https://discuss.newrelic.com/t/using-newrelic-with-sails-js/3338/8).


Here's an example configuring [Winston](https://github.com/winstonjs/winston) as a custom logger, defining both a console transport and file transport.
First of all, add `winston` as a dependency of your project:

```bash
npm install winston
```

Then, replace the content of `config/log.js` with the following:

```javascript
// config/log.js

const { version } = require('../package');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, label, printf, align } = format;
const { SPLAT } = require('triple-beam');
const { isObject } = require('lodash');

function formatObject(param) {
  if (isObject(param)) {
    return JSON.stringify(param);
  }
  return param;
}

// Ignore log messages if they have { private: true }
const all = format((info) => {
  const splat = info[SPLAT] || [];
  const message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  info.message = `${message} ${rest}`;
  return info;
});

const customLogger = createLogger({
  format: combine(
    all(),
    label({ label: version }),
    timestamp(),
    colorize(),
    align(),
    printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${formatObject(info.message)}`)
  ),
  transports: [new transports.Console()]
});

module.exports.log = {
  custom: customLogger,
  inspect: false
  // level: 'info'
};

```



<docmeta name="displayName" value="sails.config.log">
<docmeta name="pageType" value="property">

