# sails.log()

Log a message or some data at the "debug" [log level](https://sailsjs.com/documentation/reference/configuration/sails-config-log) using Sails' [built-in logger](https://sailsjs.com/documentation/concepts/logging).


```usage
sails.log(...);
```


### Usage

This function's usage is purposely very similar to Node's [`console.log()`](https://nodejs.org/api/console.html#console_console_log_data), but with a handful of extra features&mdash;namely support for multiple log levels with colorized, prefixed console output.

Note that standard `console.log()` conventions from Node.js apply:
 - takes an [unlimited number](https://en.wikipedia.org/wiki/Variadic_function) of arguments, separated by commas
 - printf-style parameterization (&agrave; la [`util.format()`](https://nodejs.org/api/util.html#util_util_format_format))
 - objects, dates, arrays, and most other data types are pretty-printed using the built-in logic in [`util.inspect()`](https://nodejs.org/api/util.html#util_util_inspect_object_options) (e.g. you see `{ pet: { name: 'Hamlet' } }` instead of `[object Object]`.)
 - if you log an object with a custom `inspect()` method, that method will run automatically, and the string that it returns will be written to the console.



### Example

```javascript
var sum = +req.param('x') + +req.param('y');
sails.log();
sails.log('Hey %s, did you know that the sum of %d and %d is %d?', req.param('name'), +req.param('x'), +req.param('y'), sum);
sails.log('Bet you didn\'t know robots could do math, huh?');
sails.log();
sails.log('Anyways, here is a dictionary containing all the parameters I received in this request:', req.allParams());
sails.log('Until next time!');
return res.ok();
```




### Notes
> - For a deeper conceptual exploration of logging in Sails, see [concepts/logging](https://sailsjs.com/documentation/concepts/logging).
> - Remember that, in addition to being exposed as an alternative to calling `console.log` directly, the built-in logger in Sails is called internally by the framework.  The Sails logger can be configured, or completely overridden, using built-in log configuration settings ([`sails.config.log`](https://sailsjs.com/documentation/reference/configuration/sails-config-log)).
> - Keep in mind that, like any part of Sails, `sails.log` is completely optional.  Most&mdash;but not all&mdash;Sails apps take advantage of the built-in logger: some users prefer to stick with `console.log()`, while others `require()` more feature-rich libraries like [Winston](https://www.npmjs.com/package/winston). If you aren't sure what your app needs yet, start with the built-in logger and go from there.

<docmeta name="displayName" value="sails.log()">
<docmeta name="pageType" value="method">

