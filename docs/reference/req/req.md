# Request (`req`)

Sails is built on [Express](https://github.com/balderdashy/sails/blob/master/docs/PAGE_NEEDED.md), and uses [Node's HTTP server](http://nodejs.org/api/http.html) conventions.  Because of this, you can access all of the Node and Express methods and properties on the `req` object wherever it is accessible (in your controllers, policies, and custom responses).

A nice side effect of this compatibility is that, in many cases, you can paste existing Node.js code into a Sails app and it will work.  And since Sails implements a transport-agnostic request interpreter, the code in your Sails app is WebSocket-compatible as well.

Sails adds a few methods and properties of its own to the `req` object, like [`req.wantsJSON`](https://sailsjs.com/documentation/reference/request-req/req-wants-json) and [`req.allParams()`](https://sailsjs.com/documentation/reference/request-req/req-all-params).  These features are syntactic sugar on top of the underlying implementation, and also support both HTTP and WebSockets.


<!--
### Protocol Support

The chart below describes support for the methods and properties on [`req`](https://sailsjs.com/documentation/reference/request-req), the Sails request object (`req`), across HTTP and WebSockets:


|                          | HTTP    | WebSockets |
|--------------------------|---------|------------|
| req.file()               | :white_check_mark: | :white_large_square: |
| req.param()              | :white_check_mark: | :white_check_mark: |
| req.route                | :white_check_mark: | :white_check_mark: |
| req.cookies              | :white_check_mark: | :white_large_square: |
| req.signedCookies        | :white_check_mark: | :white_large_square: |
| req.get()                | :white_check_mark: | :white_large_square: |
| req.accepts()            | :white_check_mark: | :white_large_square: |
| req.accepted             | :white_check_mark: | :white_large_square: |
| req.is()                 | :white_check_mark: | :white_large_square: |
| req.ip                   | :white_check_mark: | :white_check_mark: |
| req.ips                  | :white_check_mark: | :white_large_square: |
| req.path                 | :white_check_mark: | :white_large_square: |
| req.host                 | :white_check_mark: | :white_large_square: |
| req.fresh                | :white_check_mark: | :white_large_square: |
| req.stale                | :white_check_mark: | :white_large_square: |
| req.xhr                  | :white_check_mark: | :white_large_square: |
| req.protocol             | :white_check_mark: | :white_check_mark: |
| req.secure               | :white_check_mark: | :white_large_square: |
| req.session              | :white_check_mark: | :white_check_mark: |
| req.subdomains           | :white_check_mark: | :white_large_square: |
| req.method               | :white_check_mark: | :white_check_mark: |
| req.originalUrl          | :white_check_mark: | :white_large_square: |
| req.acceptedLanguages    | :white_check_mark: | :white_large_square: |
| req.acceptedCharsets     | :white_check_mark: | :white_large_square: |
| req.acceptsCharset()     | :white_check_mark: | :white_large_square: |
| req.acceptsLanguage()    | :white_check_mark: | :white_large_square: |
| req.isSocket             | :white_check_mark: | :white_check_mark: |
| req.allParams()          | :white_check_mark: | :white_check_mark: |
| req.transport            | :white_large_square: | :white_check_mark: |
| req.url                  | :white_check_mark: | :white_check_mark: |
| req.wantsJSON            | :white_check_mark: | :white_check_mark: |


### Legend

  - :white_check_mark: - fully supported
  - :white_large_square: - feature not yet implemented
  - :heavy_multiplication_x: - unsupported due to protocol restrictions


-->


<docmeta name="displayName" value="Request (`req`)">
<docmeta name="stabilityIndex" value="3">
