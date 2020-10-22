# Logging

Sails comes with a simple, built-in logger called [`captains-log`](https://github.com/balderdashy/captains-log).  Its usage is functionally very similar to Node's [`console.log`](https://nodejs.org/api/console.html#console_console_log_data), but with a handful of extra features, namely support for multiple log levels with colorized, prefixed console output. The logger serves two purposes:
+ it emits warnings, errors, and other console output from inside the Sails framework
+ it can be used to emit [custom events/messages](https://sailsjs.com/documentation/concepts/logging/custom-log-messages) from within your application code


### Configuration
Sails' log configuration is determined by [`sails.config.log`](https://sailsjs.com/documentation/reference/configuration/sails-config-log), which is conventionally set by a generated configuration file ([`config/log.js`](https://sailsjs.com/documentation/anatomy/my-app/config/log-js)) in new Sails projects out of the box.

### Usage

```javascript
sails.log.info('I am an info-level message.');
sails.log('I am a debug-level message');
sails.log.warn('I am a warn-level message');
```

### Log levels

Using the built-in logger, Sails will write output (to stdout/stderr) for log function calls that are _at_ or _above_ the priority of the currently-configured log level.  This log level is normalized and also applied to generated output from Grunt, Socket.io, Waterline, Express, and other dependencies. The hierarchy of log levels and their relative priorities is summarized by the chart below:

| Priority | Level     | Log fns that produce visible output   |
|----------|-----------|:--------------------------------------|
| 0        | silent    | _N/A_
| 1        | error     | `.error()`            |
| 2        | warn      | `.warn()`, `.error()` |
| 3        | debug     | `.debug()`, `.warn()`, `.error()` |
| 4        | info      | `.info()`, `.debug()`, `.warn()`, `.error()` |
| 5        | verbose   | `.verbose()`, `.info()`, `.debug()`, `.warn()`, `.error()` |
| 6        | silly     | `.silly()`, `.verbose()`, `.info()`, `.debug()`, `.warn()`, `.error()` |


#### Notes
 + The [default log level](https://sailsjs.com/documentation/reference/configuration/sails-config-log) is **info**.  When your app's log level is set to "info", Sails logs limited information about the server/app's status.
 + When running automated tests for your app, it is often helpful to set the log level to **error**.
 + When the log level is set to **verbose**, Sails logs Grunt output, as well as much more detailed information on the routes, models, hooks, etc. that were loaded.
 + When the log level is set to **silly**, Sails outputs everything from **verbose** as well as internal information on which routes are being bound and other detailed framework lifecycle information, diagnostics, and implementation details.



<docmeta name="displayName" value="Logging">
