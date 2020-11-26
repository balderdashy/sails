# Custom log messages

It is often useful to emit custom log messages or events from your application code; whether you are tracking the status of outbound emails sent in the background, or just looking for a configurable alternative to calling [`console.log()`](https://nodejs.org/api/console.html#console_console_log_data) in your application code.

For convenience, Sails exposes its internal logging interface as `sails.log`.  Its usage is purposely very similar to Node's `console.log()`, but with a handful of extra features; namely support for multiple log levels with colorized, prefixed console output.

See [sails.log()](https://sailsjs.com/documentation/reference/application/sails-log) for more information and examples, or  [sails.config.log](https://sailsjs.com/documentation/reference/configuration/sails-config-log) for configuration options.


## Available methods

Each of the log methods below accepts an infinite number of arguments of any data type, seperated by commas.  Like `console.log`, data passed as arguments to the Sails logger are automatically prettified for readability using Node's [`util.inspect()`](http://nodejs.org/api/util.html#util_util_inspect_object_options). Consequently, standard Node.js conventions apply; _any_ dictionaries, errors, dates, arrays, or other data types are pretty-printed using the built-in logic in [`util.inspect()`](https://nodejs.org/api/util.html#util_util_inspect_object_options) (e.g. you see `{ pet: { name: 'Hamlet' } }` instead of `[object Object]`.)  Also, if you log an object that has a custom `inspect()` method, the logger will run that method automatically and write the string it returns to the console.


### sails.log.error()

Writes log output to `stderr` at the "error" log level.
Useful for tracking major errors.

```js
sails.log.error('Sending 500 ("Server Error") response.');
// -> error: Sending 500 ("Server Error") response.
```

### sails.log.warn()

Writes log output to `stderr` at the "warn" log level.
Useful for tracking information about operations that failed silently.

```js
sails.log.warn('File upload quota exceeded for user #%d.  Request aborted.', user.id);
// -> warn: File upload quota exceeded for user #94271.  Request aborted.
```


### sails.log()

_aka sails.log.debug()_

The default log function, which writes console output to `stderr` at the "debug" log level.
Useful for passing around important technical information amongst your team; or as a general alternative to `console.log()`.

```js
sails.log('This endpoint (`POST /accounts`) will be deprecated in the next few days.  Please use `POST /signup` instead. ');
// -> debug: This endpoint (`POST /accounts`) will be deprecated in the next few days.  Please use `POST /signup` instead.
```



### sails.log.info()

Writes log output to `stdout` at the "info" log level.
Useful for capturing information about your app's business logic.

```js
sails.log.info('A new user (', newUser.emailAddress, ') just signed up!');
// -> info: A new user ( irl@foobar.com ) just signed up!
```


### sails.log.verbose()

Writes log output to `stdout` at the "verbose" log level.
Useful for capturing detailed information about your app that you only need on rare occasions.

```js
sails.log.verbose('A user (IP adddress: `%s`) initiated an account transfer...', req.ip);
// -> verbose: A user (IP adddress: `10.48.1.191`) initiated an account transfer...
```


### sails.log.silly()

Writes log output to `stdout` at the "silly" log level.
Useful for capturing technical details about your app that are only useful for diagnostics and/or troubleshooting.

```js
sails.log.silly(
'Successfully fetched Account record for requesting authenticated user (`%d`).',
'Took %dms.', req.param('id'), msElapsed);
// -> silly: Successfully fetched Account record for authenticated user (`49722`). Took 41ms.
```




<docmeta name="displayName" value="Custom log messages">

